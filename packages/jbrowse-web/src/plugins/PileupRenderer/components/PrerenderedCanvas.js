import React, { Component } from 'react'
import ReactPropTypes from 'prop-types'

import { ImageBitmapType } from '@gmod/jbrowse-core/util/offscreenCanvasPonyfill'

export default class PrerenderedCanvas extends Component {
  static propTypes = {
    height: ReactPropTypes.number.isRequired,
    width: ReactPropTypes.number.isRequired,
    imageData: ReactPropTypes.instanceOf(ImageBitmapType),
  }

  static defaultProps = { imageData: undefined }

  constructor(props) {
    super(props)
    this.featureCanvas = React.createRef()
  }

  componentDidMount() {
    this.draw()
  }

  componentDidUpdate() {
    this.draw()
  }

  draw() {
    const { imageData } = this.props
    if (!imageData) return
    if (imageData instanceof ImageBitmap) {
      const canvas = this.featureCanvas.current
      const context = canvas.getContext('2d')
      // console.log('got image data', imageData)
      context.drawImage(imageData, 0, 0)
    } else {
      // TODO: add support for replay-based image data here
      throw new Error(
        'unsupported imageData type. do you need to add support for it?',
      )
    }
  }

  render() {
    const { width, height } = this.props
    return <canvas ref={this.featureCanvas} width={width} height={height} />
  }
}
