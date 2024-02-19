import { Button, ButtonProps } from "@mui/material";
import { FC } from "react";

type CardTabButtonProps = {
    isActive: boolean;
    dataCy: string;
} & ButtonProps

export const CardTabButton: FC<CardTabButtonProps> = ({ isActive, dataCy, ...props }) => {
    return (
        <Button
            data-cy={dataCy}
            color={isActive ? "primary" : "secondary"}
            variant="textContained"
            size="large"
            // sx={{ pointerEvents: "none" }}
            {...props}
        />
    );
};
