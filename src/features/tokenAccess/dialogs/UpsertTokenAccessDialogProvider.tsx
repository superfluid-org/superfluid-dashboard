import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import UpsertTokenAccessFormProvider, {
  UpsertTokenAccessFormProviderProps,
} from "./UpsertTokenAccessFormProvider";
import ResponsiveDialog from "../../common/ResponsiveDialog";
import { UpsertTokenAccessForm } from "./UpsertTokenAccessForm";
import { Stack } from "@mui/material";

interface UpsertTokenAccessDialogContextValue {
  openDialog: () => void;
  closeDialog: () => void;
}

const UpsertTokenAccessDialogContext =
  createContext<UpsertTokenAccessDialogContextValue>(null!);

export const useUpsertTokenAccessDialog = () =>
  useContext(UpsertTokenAccessDialogContext);

export interface UpsertTokenAccessDialogProps {
  children: (
    contextValue: UpsertTokenAccessDialogContextValue
  ) => ReactNode;
  initialFormValues: UpsertTokenAccessFormProviderProps["initialFormValues"];
}

export const UpsertTokenAccessDialogProvider: FC<
  UpsertTokenAccessDialogProps
> = ({ children, initialFormValues, ...props }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const contextValue = useMemo<UpsertTokenAccessDialogContextValue>(
    () => ({
      dialogOpen,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
      initialFormValues,
    }),
    [
      dialogOpen,
    ]
  );

  return (
    <UpsertTokenAccessDialogContext.Provider value={contextValue}>
      {children(contextValue)}
      <ResponsiveDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: "20px", maxHeight: "100%", maxWidth: 500 },
        }}
        translate="yes"
      >
        <Stack component={"form"}>
          <UpsertTokenAccessFormProvider
            initialFormValues={initialFormValues}
          >
            <UpsertTokenAccessForm initialFormValues={initialFormValues} />
          </UpsertTokenAccessFormProvider>
        </Stack>
      </ResponsiveDialog>
    </UpsertTokenAccessDialogContext.Provider>
  );
};
