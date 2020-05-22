import React, {useEffect, useState, createContext} from "react"
import {Rationale, Platform} from "react-native"
import {
  PERMISSIONS,
  PermissionStatus,
  Permission,
  request,
  check,
  checkNotifications,
  requestNotifications,
} from "react-native-permissions"

import {config} from './COVIDSafePathsConfig'

const PermissionStatusEnum = {
  UNKNOWN: 0,
  GRANTED: 1,
  DENIED: 2,
};

const PermissionsContext = createContext({
  locationPermission: PermissionStatusEnum.UNKNOWN,
  requestLocationPermission: () => {},
  notificationPermission: PermissionStatusEnum.UNKNOWN,
  requestNotificationPermission: () => {},
})

const PermissionsProvider = ({children}) => {
  const {tracingStrategy} = config
  const [
    locationPermission,
    setLocationPermission,
  ] = useState(PermissionStatusEnum.UNKNOWN)
  const [
    notificationPermission,
    setNotificationPermission,
  ] = useState(PermissionStatusEnum.UNKNOWN)

  const isGPS = tracingStrategy === "gps"

  useEffect(() => {
    if (isGPS) {
      checkLocationPermission()
    }

    if (Platform.OS === "ios") {
      checkNotificationStatus();
    }

    if (__DEV__ && isGPS) {
      checkSubsriptionStatus();
    }
  });

  const checkLocationPermission = async () => {
    console.log("checking location")
    check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then((result) => {
      console.log("got location", result)
      setLocationPermission(result)
    })
  }

  const checkNotificationStatus = () => {}
  const checkSubsriptionStatus = () => {}


  // const locationWhenInUseRationale = {
  //   title: "foo",
  //   message: "foo",
  //   buttonPositive: "foo",
  //   buttonNegative: "foo",
  //   buttonNeutral: "strings.buttonNeutral",
  // }

  const requestLocationPermission = () => {
    console.log('in context, requesting permissions...')
    if (Platform.OS === "ios") {
      requestLocationForPlatform(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
    } else if (Platform.OS === "android") {
      requestLocationForPlatform(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
    }
  }

  const requestLocationForPlatform = async (permission) => {
    // request(permission, locationWhenInUseRationale).then(
    const status = await request(permission)

    console.log("got result", status)
    switch (status) {
      case "unavailable": {
        setLocationPermission(PermissionStatusEnum.UNKNOWN)
        break;
      }
      case "denied": {
        setLocationPermission(PermissionStatusEnum.DENIED)
        break;
      }
      case "blocked": {
        setLocationPermission(PermissionStatusEnum.DENIED)
        break;
      }
      case "granted": {
        setLocationPermission(PermissionStatus.GRANTED)
        break;
      }
      default: {
        setLocationPermission(PermissionStatusEnum.UNKNOWN)
        break;
      }

    }
  }

  const requestNotificationPermission = () => {}


  return (
    <PermissionsContext.Provider
      value={{
        locationPermission,
        requestLocationPermission,
        notificationPermission,
        requestNotificationPermission
      }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export {PermissionsProvider}
export default PermissionsContext
