import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { encrypt } from '../utils/encryption'
import { to } from '../utils/async'
import { downloadFromStorage } from '../utils/cloudStorage'

/**
 * Download service account from Cloud Storage and store it as an encrypted
 * string within Firestore. Could be a storage function, but it
 * would require more code due to being triggered for all storage files.
 * @param snap - Event snapshot
 * @returns Resolves with filePath
 */
async function handleServiceAccountCreate(
  snap: functions.firestore.DocumentSnapshot
): Promise<null> {
  const eventData = snap.data()
  if (!eventData?.serviceAccount) {
    throw new Error(
      'serviceAccount parameter is required to copy service account to Firestore'
    )
  }
  const {
    serviceAccount: { fullPath }
  } = eventData
  // Download service account from Cloud Storage
  const [downloadErr, fileData] = await to(downloadFromStorage(null, fullPath))

  // Handle errors downloading service account
  if (downloadErr) {
    console.error(
      'Error downloading service account from storage:',
      downloadErr.message || downloadErr
    )
    throw downloadErr
  }

  // Write encrypted service account data to serviceAccount parameter of environment document
  const [updateErr] = await to(
    snap.ref.update('serviceAccount', {
      ...eventData.serviceAccount,
      credential: encrypt(fileData)
    })
  )

  // Handle errors updating Firestore with service account
  if (updateErr) {
    console.error(
      'Error updating Firestore with service account:',
      updateErr.message || updateErr
    )
    throw updateErr
  }

  console.log('Service account copied to Firestore, cleaning up...')

  // Remove service account file from cloud storage
  const fileRef = admin.storage().bucket().file(fullPath)
  const [deleteErr] = await to(fileRef.delete())

  // Handle errors deleteting service account (still exists successfully)
  if (deleteErr) {
    console.error(
      `Error removing service account from Cloud Storage: ${deleteErr.message}`,
      deleteErr
    )
  }

  console.log('Cleaning up successful, exiting.')

  return null
}

/**
 * @name copyServiceAccountToFirestore
 * Copy service account to Firestore from Cloud Storage when new service
 * account meta data is added to Firestore
 * @type {functions.CloudFunction}
 */
export default functions.firestore
  .document(
    'projects/{projectId}/environments/{environmentId}'
    // 'projects/{projectId}/environments/{environmentId}/serviceAccounts/{serviceAccountId}' // for serviceAccounts as subcollection
  )
  .onCreate(handleServiceAccountCreate)
