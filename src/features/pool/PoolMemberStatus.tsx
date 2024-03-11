import { Typography, TypographyProps } from "@mui/material";
import { PoolMember } from "@superfluid-finance/sdk-core";
import { FC, useMemo } from "react";

type Props = {
    poolMember: PoolMember;
    TypographyProps?: TypographyProps;
}

type Status = {
    name: string;
    color: string;
}

export const PoolMemberStatus: FC<Props> = ({
    poolMember,
    TypographyProps = {}
}) => {
    const { name, color } = useMemo<Status>(() => {
        if (poolMember.isConnected) {
            return {
                name: "Connected",  
                color: "primary"
            }
        } else {
            return {
                name: "Not Connected",
                color: "warning.main"
            }
        }
    }, [poolMember]);

    return (
        <Typography
            data-cy={"pool-member-status"}
            variant="h7"
            component="span"
            color={color}
            {...TypographyProps}
        >
            {name}
        </Typography>
    )
}

