import {
    Box,
    Button,
    Collapse,
    ListItemAvatar,
    Menu,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup,
    useTheme,
} from "@mui/material";
import { FC, memo, MouseEvent, useEffect, useState } from "react";
import { Network } from "../../network/networks";
import NetworkIcon from "../../network/NetworkIcon";
import OpenIcon from "../../../components/OpenIcon/OpenIcon";
import { useAvailableNetworks } from "../../network/AvailableNetworksContext";

interface NetworkItemProps {
    network: Network;
    selected: boolean;
    onClick: () => void;
}

const NetworkItem: FC<NetworkItemProps> = ({ network, selected, onClick }) => (
    <MenuItem
        data-cy={`${network.slugName}-button`}
        key={network.id}
        onClick={onClick}
        selected={selected}
        sx={{ height: 50 }}
    >
        <ListItemAvatar sx={{ mr: 1 }}>
            <NetworkIcon network={network} size={24} fontSize={16} />
        </ListItemAvatar>
        {network.name}
    </MenuItem>
);

const NetworkSelect: FC<{
    network: Network | undefined;
    onChange: (network: Network) => void;
    placeholder?: string;
    disabled: boolean;
    predicate?: (network: Network) => boolean
}> = ({ network: selectedNetwork, onChange, placeholder, disabled, predicate = (network: Network) => true }) => {
    const theme = useTheme();

    const { availableMainNetworks, availableTestNetworks } =
        useAvailableNetworks();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [showTestnets, setShowTestnets] = useState(false);

    const open = Boolean(anchorEl);

    useEffect(() => {
        setShowTestnets(!!selectedNetwork?.testnet);
    }, [selectedNetwork]);

    const handleOpen = (event: MouseEvent<HTMLButtonElement>) =>
        setAnchorEl(event.currentTarget);

    const handleClose = () => setAnchorEl(null);

    const handleShowTestnetsChange = (
        _e: unknown,
        testActive: boolean | null
    ) => {
        if (testActive !== null) setShowTestnets(testActive);
    };

    return (
        <>
            <Button
                disabled={disabled}
                variant="outlined"
                color="secondary"
                size="large"
                fullWidth={true}
                startIcon={
                    selectedNetwork && (
                        <NetworkIcon network={selectedNetwork!} size={24} fontSize={16} />
                    )
                }
                endIcon={<OpenIcon open={open} />}
                onClick={handleOpen}
                sx={{
                    minWidth: "200px",
                    justifyContent: "flex-start",
                    ".MuiButton-startIcon > *:nth-of-type(1)": { fontSize: "16px" },
                    ".MuiButton-endIcon": { marginLeft: "auto" },
                }}
                translate="no"
            >
                {selectedNetwork?.name || placeholder}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{ sx: { minWidth: 280 }, square: true }}
                sx={{ marginTop: theme.spacing(1.5) }}
            >
                <Collapse in={!showTestnets} timeout="auto" unmountOnExit>
                    {availableMainNetworks.filter((n) => n.autoWrap?.managerContractAddress).map((network) => (
                        <NetworkItem
                            key={network.id}
                            onClick={() => {
                                onChange(network);
                                handleClose();
                            }}
                            selected={network.id === selectedNetwork?.id}
                            network={network}
                        />
                    ))}
                </Collapse>

                <Collapse in={showTestnets} timeout="auto" unmountOnExit>
                    {availableTestNetworks
                        .filter(predicate)
                        .map((network) => (
                            <NetworkItem
                                key={network.id}
                                onClick={() => {
                                    onChange(network);
                                    handleClose();
                                }}
                                selected={network.id === selectedNetwork?.id}
                                network={network}
                            />
                        ))}
                </Collapse>

                <Box sx={{ margin: "6px 16px" }}>
                    <ToggleButtonGroup
                        exclusive
                        fullWidth
                        size="small"
                        color="primary"
                        value={showTestnets}
                        onChange={handleShowTestnetsChange}
                    >
                        <ToggleButton data-cy={"mainnets-button"} value={false}>
                            Mainnets
                        </ToggleButton>
                        <ToggleButton data-cy={"testnets-button"} value={true}>
                            Testnets
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Menu>
        </>
    );
};

export default memo(NetworkSelect);