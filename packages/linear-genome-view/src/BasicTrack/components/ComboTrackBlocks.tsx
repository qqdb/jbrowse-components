import { makeStyles } from '@material-ui/core/styles'
import { observer, PropTypes } from 'mobx-react'
import { Instance } from 'mobx-state-tree'
import React from 'react'
import { BlockBasedTrackStateModel } from '../blockBasedTrackModel'
import { LinearGenomeViewStateModel } from '../../LinearGenomeView'
import { RenderedBlocks, useStyles } from './TrackBlocks'

interface ComboBlockBasedTrackStateModel
  extends Instance<BlockBasedTrackStateModel> {
  AlignmentsTrack?: Instance<BlockBasedTrackStateModel>
  SNPCoverageTrack?: Instance<BlockBasedTrackStateModel>
}

function ComboTrackBlocks({
  model,
  viewModel,
}: {
  model: ComboBlockBasedTrackStateModel
  viewModel: Instance<LinearGenomeViewStateModel>
}) {
  const classes = useStyles()
  const { AlignmentsTrack, SNPCoverageTrack } = model
  return (
    <>
      {SNPCoverageTrack && (
        <div
          data-testid="Blockset"
          className={classes.trackBlocks}
          style={{
            left:
              SNPCoverageTrack.blockDefinitions.offsetPx - viewModel.offsetPx,
          }}
        >
          <RenderedBlocks model={SNPCoverageTrack} />
        </div>
      )}
      {AlignmentsTrack && (
        <div
          data-testid="Blockset"
          className={classes.trackBlocks}
          style={{
            left:
              AlignmentsTrack.blockDefinitions.offsetPx - viewModel.offsetPx,
            top: SNPCoverageTrack ? SNPCoverageTrack.height : 0,
          }}
        >
          <RenderedBlocks model={AlignmentsTrack} />
        </div>
      )}
    </>
  )
}

ComboTrackBlocks.propTypes = {
  model: PropTypes.observableObject.isRequired,
  viewModel: PropTypes.observableObject.isRequired,
}

export default observer(ComboTrackBlocks)
