import React from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import styles from './NewProjectDialog.styles'

const useStyles = makeStyles(styles)

function NewProjectDialog({ onSubmit, open, onRequestClose }) {
  const classes = useStyles()
  const {
    register,
    handleSubmit,
    errors,
    formState: { isSubmitting, isValid }
  } = useForm({ mode: 'onChange' })
  return (
    <Dialog open={open} onClose={onRequestClose}>
      <DialogTitle id="new-project-dialog-title">New Project</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} className={classes.inputs}>
        <DialogContent>
          <TextField
            error={!!errors.name}
            helperText={errors.name && 'Name is required'}
            name="name"
            label="Project Name"
            inputRef={register({
              required: true
            })}
            data-test="new-project-name"
            margin="normal"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onRequestClose} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            disabled={isSubmitting || !isValid}
            data-test="new-project-create-button">
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

NewProjectDialog.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired
}

export default NewProjectDialog
