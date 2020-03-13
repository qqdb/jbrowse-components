import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import React, { useState, useEffect } from 'react'
import { YScaleBar } from '@gmod/jbrowse-plugin-wiggle/src/WiggleTrack/components/WiggleTrackComponent'
import CenterLine from '@gmod/jbrowse-plugin-linear-genome-view/src/LinearGenomeView/components/CenterLine'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Icon from '@material-ui/core/Icon'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import NestedMenuItem from '@gmod/jbrowse-core/ui/NestedMenuItem'
import AlignmentsBlockBasedTrack from './AlignmentsBlockBasedTrack'

// import ContextMenu from '@gmod/jbrowse-core/ui/ContextMenu'

const initialState = {
  mouseX: null,
  mouseY: null,
}

function AlignmentsTrackComponent(props) {
  const { model } = props
  const {
    PileupTrack,
    SNPCoverageTrack,
    height,
    menuOptions,
    subMenuOptions,
    showPileup,
    showCoverage,
    showCenterLine,
    centerLinePosition,
    sortedBy,
  } = model

  let showScalebar = false
  if (SNPCoverageTrack) {
    const { ready, stats, needsScalebar } = SNPCoverageTrack
    if (ready && stats && needsScalebar) showScalebar = true
  }

  if (showCenterLine) model.setCenterLine() // calculates when scrolling

  // Set up context menu
  const [state, setState] = useState(initialState)
  const zIndex = 10000 // zIndex matches tooltip zindex to bring to front
  const handleRightClick = e => {
    e.preventDefault()
    setState(() => ({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
    }))
  }

  const handleClose = () => {
    setState(initialState)
  }

  // determine height of the model when toggling pileuptrack
  useEffect(() => {
    const newHeight = !showPileup
      ? Math.min(model.height, SNPCoverageTrack.height)
      : Math.max(model.height, SNPCoverageTrack.height + PileupTrack.height)
    model.setHeight(newHeight)
  }, [PileupTrack.height, SNPCoverageTrack.height, model, showPileup])

  return (
    <div
      onContextMenu={handleRightClick}
      style={{ position: 'relative', height }}
    >
      <AlignmentsBlockBasedTrack
        {...props}
        {...PileupTrack}
        {...SNPCoverageTrack}
        showPileup={showPileup}
        showSNPCoverage={showCoverage}
      >
        {showCenterLine && centerLinePosition > 0 && (
          <CenterLine model={model} height={height}></CenterLine>
        )}
        {showScalebar && showCoverage ? (
          <YScaleBar model={SNPCoverageTrack} />
        ) : null}
      </AlignmentsBlockBasedTrack>
      <Menu
        keepMounted
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null
            ? { top: state.mouseY, left: state.mouseX }
            : undefined
        }
        style={{ zIndex }}
      >
        {menuOptions.map(option => {
          return (
            <MenuItem
              key={option.key}
              onClick={() => {
                option.callback()
                handleClose()
              }}
              disabled={option.disableCondition || false}
            >
              {option.icon ? (
                <ListItemIcon key={option.key} style={{ minWidth: '30px' }}>
                  <Icon color="primary" fontSize="small">
                    {option.icon}
                  </Icon>
                </ListItemIcon>
              ) : null}

              {option.title}
            </MenuItem>
          )
        })}
        <NestedMenuItem
          {...props}
          label="Sort by"
          parentMenuOpen={state !== initialState}
          zIndex={zIndex}
          tabIndex={-1}
        >
          {subMenuOptions.map(option => {
            return (
              <MenuItem
                key={option.key}
                style={{
                  backgroundColor:
                    sortedBy !== '' &&
                    sortedBy === option.key &&
                    'darkseagreen',
                }}
                onClick={() => {
                  model.sortSelected(option.key)
                  handleClose()
                }}
              >
                {option.title}
              </MenuItem>
            )
          })}
        </NestedMenuItem>
      </Menu>
    </div>
  )
}

AlignmentsTrackComponent.propTypes = {
  model: MobxPropTypes.observableObject.isRequired,
}

export default observer(AlignmentsTrackComponent)
