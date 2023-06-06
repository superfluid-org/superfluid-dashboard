import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { ModifyOrAddTokenAccessFormProviderProps } from "./ModifyOrAddTokenAccessFormProvider";
import ResponsiveDialog from "../../common/ResponsiveDialog";
import ModifyOrAddTokenAccessDialog from "./ModifyOrAddTokenAccessDialog";

interface ModifyOrAddTokenAccessBoundaryContextValue {
  openDialog: () => void;
  closeDialog: () => void;
  initialFormValues: ModifyOrAddTokenAccessFormProviderProps["initialFormValues"];
}

const ModifyOrAddTokenAccessBoundaryContext =
  createContext<ModifyOrAddTokenAccessBoundaryContextValue>(null!);

export const useModifyOrAddTokenAccessBoundary = () =>
  useContext(ModifyOrAddTokenAccessBoundaryContext);

export interface ModifyOrAddTokenAccessBoundaryProps {
  children: (
    ModifyOrAddTokenAccessContext: ModifyOrAddTokenAccessBoundaryContextValue
  ) => ReactNode;
  initialFormValues: ModifyOrAddTokenAccessFormProviderProps["initialFormValues"];
}

export const AddOrModifyDialogBoundary: FC<
  ModifyOrAddTokenAccessBoundaryProps
> = ({ children, initialFormValues, ...props }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const contextValue = useMemo<ModifyOrAddTokenAccessBoundaryContextValue>(
    () => ({
      dialogOpen,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
      initialFormValues,
    }),
    [dialogOpen, 
      // initialFormValues // TODO(KK): Exclude for now. This will cause issues later.
    ]
  );

  return (
    <ModifyOrAddTokenAccessBoundaryContext.Provider value={contextValue}>
      {children(contextValue)}
      <ResponsiveDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: "20px", maxHeight: "100%", maxWidth: 500 },
        }}
        translate="yes"
      >
        <ModifyOrAddTokenAccessDialog />
      </ResponsiveDialog>
    </ModifyOrAddTokenAccessBoundaryContext.Provider>
  );
};
