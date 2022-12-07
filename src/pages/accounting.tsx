import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { NextPage } from "next";
import { useState } from "react";
import AccountingExportForm from "../features/accounting/AccountingExportForm";
import AccountingExportFormProvider from "../features/accounting/AccountingExportFormProvider";
import AccountingExportPreview from "../features/accounting/AccountingExportPreview";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

const Accounting: NextPage = () => {
  const theme = useTheme();
  const [showPreview, setShowPreview] = useState(false);

  const onSubmitForm = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  const exportData = () => {
    // This is a workaround to trigger DataGrid internal functionality from outside
    const exportBtn = document.querySelector(
      "#export-btn"
    ) as HTMLButtonElement;
    if (exportBtn) exportBtn.click();
  };

  return (
    <Container maxWidth="lg">
      <AccountingExportFormProvider initialFormValues={{}}>
        {!showPreview && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              [theme.breakpoints.up("md")]: {
                my: 4,
              },
            }}
          >
            <AccountingExportForm onSubmit={onSubmitForm} />
          </Box>
        )}
        {showPreview && (
          <Stack gap={4}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" gap={2} alignItems="center">
                <IconButton onClick={closePreview}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h3" component="h1">
                  Export Preview
                </Typography>
              </Stack>
              <Button
                variant="contained"
                color="primary"
                onClick={exportData}
                endIcon={<FileDownloadRoundedIcon />}
              >
                Export CSV
              </Button>
            </Stack>
            <AccountingExportPreview />
          </Stack>
        )}
      </AccountingExportFormProvider>
    </Container>
  );
};

export default Accounting;
