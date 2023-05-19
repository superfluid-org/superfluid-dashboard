import { DialogContent, Stack } from "@mui/material";
import { FC, PropsWithChildren } from "react";

const EditDialogContent: FC<PropsWithChildren> = ({
    children,
}) => {
    return (
        <Stack component={DialogContent} sx={{ p: 4 }}>
            {children}
        </Stack>
    );
};

export default EditDialogContent;