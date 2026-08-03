import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { FIRESTORE_COLLECTIONS } from '@/firebase/collections'
import { db } from '@/firebase/firebase'
import type { CreateDeviceInput, Device, UpdateDeviceInput } from '@/models'
import { logActivity } from '@/services/activityLogService'
import { firestoreService } from '@/services/firestoreService'
import { mapFirestoreError } from '@/utils/firestoreNetwork'
import { toDeviceStatusValue } from '@/utils/deviceStatus'

export class DeviceManagementService {
  private devicesCollection() {
    return collection(db, FIRESTORE_COLLECTIONS.devices)
  }

  private deviceDoc(deviceId: string) {
    return doc(db, FIRESTORE_COLLECTIONS.devices, deviceId)
  }

  private async isFieldTaken(
    field: 'assetTag' | 'imei' | 'serialNumber',
    value: string,
    excludeId?: string,
  ): Promise<boolean> {
    const trimmed = value.trim()
    if (!trimmed) {
      return false
    }

    const snapshot = await getDocs(
      query(this.devicesCollection(), where(field, '==', trimmed)),
    )

    return snapshot.docs.some((document) => {
      if (document.id === excludeId) {
        return false
      }
      const status = toDeviceStatusValue(document.data().status)
      return status !== 'deleted'
    })
  }

  async isAssetTagTaken(assetTag: string, excludeId?: string): Promise<boolean> {
    return this.isFieldTaken('assetTag', assetTag, excludeId)
  }

  async isImeiTaken(imei: string, excludeId?: string): Promise<boolean> {
    return this.isFieldTaken('imei', imei, excludeId)
  }

  async isSerialNumberTaken(
    serialNumber: string,
    excludeId?: string,
  ): Promise<boolean> {
    return this.isFieldTaken('serialNumber', serialNumber, excludeId)
  }

  private async assertUniqueIdentifiers(
    input: {
      assetTag: string
      imei: string
      serialNumber: string
    },
    excludeId?: string,
  ): Promise<void> {
    if (
      input.assetTag.trim() &&
      (await this.isAssetTagTaken(input.assetTag, excludeId))
    ) {
      throw new Error('This Asset Tag is already in use.')
    }

    if (input.imei.trim() && (await this.isImeiTaken(input.imei, excludeId))) {
      throw new Error('This IMEI is already in use.')
    }

    if (
      input.serialNumber.trim() &&
      (await this.isSerialNumberTaken(input.serialNumber, excludeId))
    ) {
      throw new Error('This Serial Number is already in use.')
    }
  }

  async createDevice(input: CreateDeviceInput): Promise<Device> {
    await this.assertUniqueIdentifiers(input)

    try {
      const payload = {
        deviceName: input.deviceName.trim(),
        brand: input.brand.trim(),
        platform: input.platform,
        model: input.model.trim(),
        assetTag: input.assetTag.trim(),
        imei: input.imei.trim(),
        serialNumber: input.serialNumber.trim(),
        osVersion: input.osVersion.trim(),
        ram: input.ram.trim(),
        storage: input.storage.trim(),
        color: input.color.trim(),
        purchaseDate: input.purchaseDate.trim(),
        notes: input.notes.trim(),
        status: 'available',
        assignedUserId: '',
        assignedUserName: '',
        assignedFloor: '',
        assignedDeskNumber: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const ref = await addDoc(this.devicesCollection(), payload)
      const created = await firestoreService.getDeviceById(ref.id)

      if (!created) {
        throw new Error('Device created but could not be loaded.')
      }

      await logActivity({
        action: 'DEVICE_CREATED',
        module: 'Device',
        targetId: created.id,
        targetName: created.deviceName,
        description: `Created device ${created.deviceName}`,
        metadata: {
          brand: created.brand,
          platform: created.platform,
          model: created.model,
          assetTag: created.assetTag,
          status: 'available',
        },
      })

      return created
    } catch (error) {
      if (error instanceof Error && error.message.includes('already in use')) {
        throw error
      }
      throw new Error(mapFirestoreError(error, 'Failed to create device.'))
    }
  }

  async updateDevice(deviceId: string, input: UpdateDeviceInput): Promise<void> {
    await this.assertUniqueIdentifiers(input, deviceId)
    const existing = await firestoreService.getDeviceById(deviceId)
    const previousStatus = existing
      ? toDeviceStatusValue(existing.status)
      : null
    const nextStatus = toDeviceStatusValue(input.status)

    try {
      await updateDoc(this.deviceDoc(deviceId), {
        deviceName: input.deviceName.trim(),
        brand: input.brand.trim(),
        platform: input.platform,
        model: input.model.trim(),
        assetTag: input.assetTag.trim(),
        imei: input.imei.trim(),
        serialNumber: input.serialNumber.trim(),
        osVersion: input.osVersion.trim(),
        ram: input.ram.trim(),
        storage: input.storage.trim(),
        color: input.color.trim(),
        purchaseDate: input.purchaseDate.trim(),
        notes: input.notes.trim(),
        status: nextStatus,
        assignedUserId: input.assignedUserId.trim(),
        assignedUserName: input.assignedUserName.trim(),
        assignedFloor: input.assignedFloor.trim(),
        assignedDeskNumber: input.assignedDeskNumber.trim(),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already in use')) {
        throw error
      }
      throw new Error(mapFirestoreError(error, 'Failed to update device.'))
    }

    const targetName = input.deviceName.trim() || existing?.deviceName || deviceId

    await logActivity({
      action: 'DEVICE_UPDATED',
      module: 'Device',
      targetId: deviceId,
      targetName,
      description: `Updated device ${targetName}`,
      metadata: {
        brand: input.brand,
        platform: input.platform,
        status: nextStatus,
        previousStatus,
      },
    })

    if (previousStatus && previousStatus !== nextStatus) {
      await logActivity({
        action: 'DEVICE_STATUS_CHANGED',
        module: 'Device',
        targetId: deviceId,
        targetName,
        description: `Changed device status from ${previousStatus} to ${nextStatus}`,
        metadata: {
          previousStatus,
          status: nextStatus,
        },
      })
    }
  }

  async softDeleteDevice(deviceId: string): Promise<void> {
    const existing = await firestoreService.getDeviceById(deviceId)

    try {
      await updateDoc(this.deviceDoc(deviceId), {
        status: 'deleted',
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      throw new Error(mapFirestoreError(error, 'Failed to delete device.'))
    }

    const targetName = existing?.deviceName || deviceId

    await logActivity({
      action: 'DEVICE_DELETED',
      module: 'Device',
      targetId: deviceId,
      targetName,
      description: `Deleted device ${targetName}`,
      metadata: {
        previousStatus: existing ? toDeviceStatusValue(existing.status) : null,
      },
    })
  }
}

export const deviceManagementService = new DeviceManagementService()
