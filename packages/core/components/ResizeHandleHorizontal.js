import React, { Component } from 'react'
import ReactPropTypes from 'prop-types'
import { withStyles } from '@material-ui/core'

const styles = {
  dragHandle: {
    background: '#ccc',
    cursor: 'ns-resize',
    width: '100%',
    boxSizing: 'border-box',
    borderTop: '1px solid #fafafa',
  },
}

class ResizeHandleHorizontal extends Component {
  static propTypes = {
    classes: ReactPropTypes.objectOf(ReactPropTypes.string).isRequired,
    objectId: ReactPropTypes.string.isRequired,
    onVerticalDrag: ReactPropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = { mouseDragging: false }

    this.mouseUp = this.mouseUp.bind(this)
    this.mouseDown = this.mouseDown.bind(this)
    this.mouseMove = this.mouseMove.bind(this)
    this.mouseLeave = this.mouseLeave.bind(this)
  }

  mouseDown(event) {
    event.preventDefault()
    window.addEventListener('mousemove', this.mouseMove, true)
    window.addEventListener('mouseup', this.mouseUp, true)
    this.setState({ mouseDragging: true })
  }

  mouseMove(event) {
    event.preventDefault()
    const { objectId, onVerticalDrag } = this.props
    const { mouseDragging } = this.state
    if (mouseDragging && this.previousMouseY !== undefined) {
      const distance = event.clientY - this.previousMouseY
      if (distance) onVerticalDrag(objectId, distance)
    }
    this.previousMouseY = event.clientY
  }

  mouseUp() {
    window.removeEventListener('mouseup', this.mouseUp, true)
    window.removeEventListener('mousemove', this.mouseMove, true)
    this.setState({ mouseDragging: false })
  }

  mouseLeave(event) {
    event.preventDefault()
  }

  render() {
    const { classes, style } = this.props
    return (
      <div
        onMouseDown={this.mouseDown}
        onMouseMove={this.mouseMove}
        onMouseLeave={this.mouseLeave}
        onMouseUp={this.mouseUp}
        role="presentation"
        className={classes.dragHandle}
        style={style}
      />
    )
  }
}

export default withStyles(styles)(ResizeHandleHorizontal)
