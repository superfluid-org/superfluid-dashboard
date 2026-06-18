import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { FC, useCallback, useEffect, useState } from 'react';
import {
  buildLocalHfaNotificationPairingUrl,
  buildMobileHfaNotificationPairingUrl,
  isLocalhostHfaUrl,
} from './hfaPushPairing';

interface HfaPushPairingCardProps {
  walletAddress: string;
}

const HfaPushPairingCard: FC<HfaPushPairingCardProps> = ({ walletAddress }) => {
  const mobilePairingUrl = buildMobileHfaNotificationPairingUrl(walletAddress);
  const localPairingUrl = buildLocalHfaNotificationPairingUrl(walletAddress);
  const qrUnavailable = isLocalhostHfaUrl(mobilePairingUrl);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState('Copy phone link');

  useEffect(() => {
    if (qrUnavailable) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;
    void import('qrcode')
      .then((QRCode) =>
        QRCode.toDataURL(mobilePairingUrl, {
          width: 200,
          margin: 1,
          errorCorrectionLevel: 'M',
        })
      )
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [mobilePairingUrl, qrUnavailable]);

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mobilePairingUrl);
      setCopyLabel('Copied');
      setTimeout(() => setCopyLabel('Copy phone link'), 2000);
    } catch {
      setCopyLabel('Copy failed');
      setTimeout(() => setCopyLabel('Copy phone link'), 2000);
    }
  }, [mobilePairingUrl]);

  return (
    <Stack
      gap={2}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box>
        <Typography variant="subtitle2">Approval notifications</Typography>
        <Typography variant="body2" color="text.secondary">
          Pair a phone to receive HFA prompts when you use the dashboard on
          another device.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center">
        {qrDataUrl ? (
          <Box
            component="img"
            src={qrDataUrl}
            alt="QR code to pair HFA push notifications on your phone"
            sx={{
              width: 200,
              height: 200,
              bgcolor: 'common.white',
              borderRadius: 1,
              p: 1,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 200,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              px: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {qrUnavailable
                ? 'QR pairing is available once HFA has a public URL (staging or production).'
                : 'Generating QR code…'}
            </Typography>
          </Box>
        )}
        <Typography variant="body2" color="text.secondary">
          Scan with your phone, allow notifications, then register on the HFA
          page.
        </Typography>
      </Stack>

      {qrUnavailable && (
        <Alert severity="info" sx={{ py: 0.5 }}>
          Set <code>NEXT_PUBLIC_HFA_MOBILE_PAIRING_URL</code> to your public HFA
          origin on staging.
        </Alert>
      )}

      <Stack gap={1}>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => {
            window.open(localPairingUrl, '_blank', 'noopener,noreferrer');
          }}
        >
          Enable on this device
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          disabled={qrUnavailable}
          onClick={() => void onCopyLink()}
        >
          {copyLabel}
        </Button>
      </Stack>
    </Stack>
  );
};

export default HfaPushPairingCard;
