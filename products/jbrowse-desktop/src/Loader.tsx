import PluginManager from '@jbrowse/core/PluginManager'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'
import React, { useEffect, useState } from 'react'
import { PluginConstructor } from '@jbrowse/core/Plugin'
import { AnyConfigurationModel } from '@jbrowse/core/configuration/configurationSchema'
import { SnapshotIn } from 'mobx-state-tree'
import PluginLoader from '@jbrowse/core/PluginLoader'
import {
  writeAWSAnalytics,
  writeGAAnalytics,
} from '@jbrowse/core/util/analytics'
import { readConfObject } from '@jbrowse/core/configuration'
import corePlugins from './corePlugins'
import JBrowse from './JBrowse'
import JBrowseRootModelFactory from './rootModel'
import packagedef from '../package.json'

const { electron } = window

const useStyles = makeStyles({
  loadingIndicator: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
  },
})

export default function Loader({
  initialTimestamp,
}: {
  initialTimestamp: number
}) {
  const [configSnapshot, setConfigSnapshot] = useState<
    SnapshotIn<AnyConfigurationModel>
  >()
  const [plugins, setPlugins] = useState<PluginConstructor[]>()

  const classes = useStyles()

  const ipcRenderer = (electron && electron.ipcRenderer) || {
    invoke: () => {},
  }

  useEffect(() => {
    async function fetchConfig() {
      try {
        setConfigSnapshot(
          Object.assign(await ipcRenderer.invoke('loadConfig'), {
            configuration: { rpc: { defaultDriver: 'ElectronRpcDriver' } },
          }),
        )
      } catch (error) {
        setConfigSnapshot(() => {
          throw error
        })
      }
    }

    fetchConfig()
  }, [ipcRenderer])

  useEffect(() => {
    async function fetchPlugins() {
      // Load runtime plugins
      if (configSnapshot) {
        try {
          const pluginLoader = new PluginLoader(configSnapshot.plugins)
          pluginLoader.installGlobalReExports(window)
          const runtimePlugins = await pluginLoader.load()
          setPlugins([...corePlugins, ...runtimePlugins])
        } catch (error) {
          setConfigSnapshot(() => {
            throw error
          })
        }
      }
    }
    fetchPlugins()
  }, [configSnapshot])

  if (!(configSnapshot && plugins)) {
    return (
      <CircularProgress
        disableShrink
        className={classes.loadingIndicator}
        size={50}
      />
    )
  }

  const pluginManager = new PluginManager(plugins.map(P => new P()))
  pluginManager.createPluggableElements()

  const JBrowseRootModel = JBrowseRootModelFactory(pluginManager)
  let rootModel
  try {
    if (configSnapshot) {
      rootModel = JBrowseRootModel.create({
        jbrowse: configSnapshot,
        assemblyManager: {},
        version: packagedef.version,
      })
    }
  } catch (e) {
    console.error(e)
    const additionalMsg =
      e.message.length > 10000 ? '... see console for more' : ''
    throw new Error(e.message.slice(0, 10000) + additionalMsg)
  }

  if (rootModel) {
    // make some things available globally for testing
    // e.g. window.MODEL.views[0] in devtools
    // @ts-ignore
    window.MODEL = rootModel.session
    // @ts-ignore
    window.ROOTMODEL = rootModel
    pluginManager.setRootModel(rootModel)

    pluginManager.configure()

    if (
      rootModel &&
      !readConfObject(rootModel.jbrowse.configuration, 'disableAnalytics')
    ) {
      writeAWSAnalytics(rootModel, initialTimestamp)
      writeGAAnalytics(rootModel, initialTimestamp)
    }
  }

  return <JBrowse pluginManager={pluginManager} />
}
