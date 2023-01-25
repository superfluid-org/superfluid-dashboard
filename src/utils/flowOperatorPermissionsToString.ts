import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
  ACL_UPDATE_PERMISSION,
} from "../features/redux/endpoints/flowSchedulerEndpoints";

export const flowOperatorPermissionsToString = (permissions: number) => {
  const hasCreatePermission = permissions & ACL_CREATE_PERMISSION;
  const hasUpdatePermission = permissions & ACL_UPDATE_PERMISSION;
  const hasDeletePermission = permissions & ACL_DELETE_PERMISSION;

  const permissionNames = [
    ...(hasCreatePermission ? ["Create"] : []),
    ...(hasUpdatePermission ? ["Update"] : []),
    ...(hasDeletePermission ? ["Delete"] : []),
  ];

  if (!permissionNames.length) {
    return "–";
  }

  return permissionNames.join(", ");
};
