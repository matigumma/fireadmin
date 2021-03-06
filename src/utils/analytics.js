import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/analytics'
import ANALYTICS_EVENT_NAMES from 'constants/analytics'
import { PROJECTS_COLLECTION } from 'constants/firebasePaths'
import { version } from '../../package.json'

/**
 * Set User info to analytics context
 * @param {Object} auth - User auth object
 * @param {String} auth.uid - Current user's UID
 */
export function setAnalyticsUser(auth) {
  if (auth && auth.uid) {
    if (process.env.REACT_APP_FIREBASE_measurementId) {
      firebase.analytics().setUserId(auth.uid)
      firebase.analytics().setUserProperties({
        name: auth.displayName,
        email: auth.email,
        avatar: auth.photoURL,
        version
      })
    }
    if (window.analytics) {
      window.analytics.identify(auth.uid, {
        name: auth.displayName,
        email: auth.email,
        avatar: auth.photoURL,
        version
      })
    }
  }
}

/**
 * Initialize Segment Library when in production environment
 */
export function initSegment() {
  // Only initialize if in production and segmentId exists
  if (process.env.REACT_APP_SEGMENT_ID) {
  /* eslint-disable */
    !function(){
      var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t,e){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src="https://cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a);analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.1.0";
      analytics.load(process.env.REACT_APP_SEGMENT_ID);
      analytics.page({ version });
    }}();
    /* eslint-enable */
  }
}

/**
 * Trigger analytics event within Firebase analytics and
 * @param {Object} eventData - Data associated with the event.
 */
export function triggerAnalyticsEvent(eventNameKey, eventData) {
  const eventName = ANALYTICS_EVENT_NAMES[eventNameKey]
  if (!eventName) {
    /* eslint-disable no-console */
    console.warn(
      `Event name for event key: "${eventNameKey}" not found. Check ANALYTICS_EVENT_NAMES in src/constants.js.`
    )
  } else if (window.Cypress) {
    console.debug(
      'Skipping tracking of event - running in the Cypress environment'
    )
    /* eslint-enable no-console */
  } else {
    if (process.env.REACT_APP_FIREBASE_measurementId) {
      firebase.analytics().logEvent(eventName, eventData)
    }
    if (process.env.REACT_APP_SEGMENT_ID && window.analytics) {
      window.analytics.track(eventName, eventData)
    }
  }
}

/**
 * Create event within project on Firestore
 * @param {Object} firestore - firestore instance (from Firebase SDK)
 * @param {String} projectId - Id of project document
 * @param {Object} pushObject - data to push with event
 * @return {Promise} Resolves with results of firestore.add call
 */
export function createProjectEvent(
  { firestore, projectId, FieldValue },
  pushObject
) {
  return firestore
    .collection(`${PROJECTS_COLLECTION}/${projectId}/events`)
    .add({
      ...pushObject,
      createdByType: 'user',
      createdAt: FieldValue.serverTimestamp()
    })
}
