import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface UnsavedChangesModalProps {
  open: boolean;
  onClose: () => void;
  onKeepEditing: () => void;
  onDiscardChanges: () => void;
}

export default function UnsavedChangesModal({
  open,
  onClose,
  onKeepEditing,
  onDiscardChanges,
}: UnsavedChangesModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Unsaved Changes</DialogTitle>
      <DialogContent>
        <Typography>
          You have unsaved changes. Do you want to keep editing or discard your changes?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onDiscardChanges}
          color="error"
          variant="outlined"
        >
          Discard Changes
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={onKeepEditing}
          variant="contained"
          color="info"
          autoFocus
        >
          Keep Editing
        </Button>
      </DialogActions>
    </Dialog>
  );
}