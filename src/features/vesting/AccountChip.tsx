import {FC} from "react";
import useAddressName from "../../hooks/useAddressName";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import {Chip, Stack, Typography} from "@mui/material";
import shortenHex from "../../utils/shortenHex";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";

export const AccountChip: FC<{
    address: string;
}> = ({address}) => {
    const addressName = useAddressName(address);

    const ShortenedAddress = (
        <AddressCopyTooltip address={addressName.addressChecksummed}>
            <Typography color="text.secondary">
                {shortenHex(addressName.addressChecksummed)}
            </Typography>
        </AddressCopyTooltip>
    );

    return (
        <Chip
            avatar={<AddressAvatar address={addressName.addressChecksummed}/>}
            label={
                addressName.ensName ? (
                    <Stack>
                        <Typography color="text.primary">
                            <AddressName address={addressName.addressChecksummed}/>
                        </Typography>
                        {ShortenedAddress}
                    </Stack>
                ) : (
                    ShortenedAddress
                )
            }
            variant="outlined"
        />
    );
};