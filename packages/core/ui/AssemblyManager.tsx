import React, { useState } from 'react'
import { getSnapshot } from 'mobx-state-tree'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create'
import DeleteIcon from '@material-ui/icons/Delete'

// const [assemblyBeingEdited,setAssemblyBeingEdited]= useState()
// edit button onClick={() => setAssemblyBeingEdited(assembly)}


const useStyles = makeStyles(() => ({
  titleBox: {
    color: '#FFFFFF',
    backgroundColor: '#0D233F',
  },
  table: {
    minWidth: 650,
  },
  buttonCell: {
    padding: 3,
  },
  button: {
    display: 'inline-block',
    padding: 0,
    minHeight: 0,
    minWidth: 0,
  },
}))

// remember to make observable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AssemblyTable(props: any) {
  const { rootModel, classes } = props
  const configSnapshot = getSnapshot(rootModel)
  console.log(getSnapshot(rootModel))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = configSnapshot.jbrowse.assemblies.map((assembly: any) => {
    const { name, aliases } = assembly
    // console.log(aliases)
    return (
      <TableRow key={name}>
        <TableCell>{name}</TableCell>
        <TableCell>{aliases.toString()}</TableCell>
        <TableCell className={classes.buttonCell}>
          <Button className={classes.button}>
            <CreateIcon color="primary" />
          </Button>
        </TableCell>
        <TableCell className={classes.buttonCell}>
          <Button className={classes.button}>
            <DeleteIcon color="error" />
          </Button>
        </TableCell>
      </TableRow>
    )
  })

  return (
    <TableContainer component={Paper}>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Aliases</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <Table>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  )
}

const AssemblyManager = ({
  rootModel,
  open,
  onClose,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootModel: any
  open: boolean
  onClose: Function
}) => {
  const classes = useStyles()
  const [isFormOpen, setFormOpen] = useState(false)

  return (
    <Dialog open={open}>
      <DialogTitle className={classes.titleBox}>Assembly Manager</DialogTitle>
      <DialogContent>
        {isFormOpen ? (
          <Button onClick={() => setFormOpen(false)}>Bomb!!!</Button>
        ) : (
          <div>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => {
                setFormOpen(true)
              }}
            >
              Add New Assembly
            </Button>
            <AssemblyTable rootModel={rootModel} classes={classes} />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => {
            onClose(false)
          }}
        >
          Return
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// remember to make observable
export default AssemblyManager
