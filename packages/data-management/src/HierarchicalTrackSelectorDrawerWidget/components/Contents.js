import CircularProgress from '@material-ui/core/CircularProgress'
import Divider from '@material-ui/core/Divider'
import FormGroup from '@material-ui/core/FormGroup'
import { withStyles } from '@material-ui/core/styles'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import { observer } from 'mobx-react-lite'
import propTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { cancelIdleCallback, requestIdleCallback } from 'request-idle-callback'
// eslint-disable-next-line import/no-cycle
import Category from './Category'
import TrackEntry from './TrackEntry'

const styles = theme => ({
  divider: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
})

function Contents(props) {
  const {
    model,
    session,
    hierarchy,
    path,
    filterPredicate,
    disabled,
    connection,
    top,
    classes,
    assemblyName,
  } = props

  let subHierarchy = hierarchy
  path.forEach(pathEntry => {
    subHierarchy = subHierarchy.get(pathEntry) || new Map()
  })

  const initialTrackConfigurations = []
  const initialCategories = []
  Array.from(subHierarchy)
    .slice(0, 50)
    .forEach(([name, contents]) => {
      if (contents.configId) {
        initialTrackConfigurations.push(contents)
      } else {
        initialCategories.push([name, contents])
      }
    })
  const [categories, setCategories] = useState(initialCategories)
  const [trackConfigurations, setTrackConfigurations] = useState(
    initialTrackConfigurations,
  )

  useEffect(() => {
    function loadMoreTracks() {
      const numLoaded = categories.length + trackConfigurations.length
      const loadedTrackConfigurations = []
      const loadedCategories = []
      Array.from(subHierarchy)
        .slice(numLoaded, numLoaded + 10)
        .forEach(([name, contents]) => {
          if (contents.configId) {
            loadedTrackConfigurations.push(contents)
          } else {
            loadedCategories.push([name, contents])
          }
        })
      setCategories(categories.concat(loadedCategories))
      setTrackConfigurations(
        trackConfigurations.concat(loadedTrackConfigurations),
      )
    }

    const handle = requestIdleCallback(loadMoreTracks)

    return function cleanup() {
      cancelIdleCallback(handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subHierarchy.size, categories.length, trackConfigurations.length])

  const { assemblyManager } = session
  const assemblyData = assemblyManager.assemblyData.get(assemblyName)
  const doneLoading =
    categories.length + trackConfigurations.length === subHierarchy.size
  return (
    <>
      {top && assemblyData && !connection ? (
        <>
          <FormGroup>
            <TrackEntry
              model={model}
              session={session}
              trackConf={assemblyData.sequence}
              assemblyName={assemblyName}
            />
          </FormGroup>
          <Divider className={classes.divider} />
        </>
      ) : null}
      <FormGroup>
        {trackConfigurations.filter(filterPredicate).map(trackConf => {
          return (
            <TrackEntry
              key={trackConf.configId}
              session={session}
              model={model}
              trackConf={trackConf}
              disabled={disabled}
            />
          )
        })}
      </FormGroup>
      {doneLoading ? null : <CircularProgress />}
      {categories.map(([name]) => (
        <Category
          key={name}
          model={model}
          session={session}
          hierarchy={hierarchy}
          path={path.concat([name])}
          filterPredicate={filterPredicate}
          disabled={disabled}
          connection={connection}
          assemblyName={assemblyName}
        />
      ))}
    </>
  )
}

Contents.propTypes = {
  model: MobxPropTypes.observableObject.isRequired,
  path: propTypes.arrayOf(propTypes.string),
  filterPredicate: propTypes.func,
  disabled: propTypes.bool,
  connection: propTypes.string,
  classes: propTypes.objectOf(propTypes.string).isRequired,
  top: propTypes.bool,
}

Contents.defaultProps = {
  filterPredicate: () => true,
  path: [],
  disabled: false,
  connection: '',
  top: false,
}

export default withStyles(styles)(observer(Contents))
