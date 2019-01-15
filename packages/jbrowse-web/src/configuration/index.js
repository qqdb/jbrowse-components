import {
  isStateTreeNode,
  getPropertyMembers,
  getSnapshot,
} from 'mobx-state-tree'
import { isObservableArray, isObservableObject } from 'mobx'

import {
  ConfigurationSchema,
  ConfigurationReference,
} from './configurationSchema'

function getModelConfig(tree) {
  // if this is a node
  if (isStateTreeNode(tree)) {
    let config
    if (isObservableObject(tree)) {
      let keys
      //   if it has a 'configuration' view, use that as the node instead
      //   otherwise, just recurse through it normally
      if (tree.configuration) {
        tree = tree.configuration
        keys = Object.keys(tree)
      } else {
        keys = Object.keys(getPropertyMembers(tree).properties)
      }
      config = {}
      keys.forEach(key => {
        config[key] = getModelConfig(tree[key])
      })
    } else if (isObservableArray(tree)) {
      config = tree.map(getModelConfig)
    }

    return config
  }
  return tree
}

function getConf(model, slotName, args) {
  if (!model.configuration)
    throw new Error(`cannot getConf on this model, it has no configuration`)
  return readConfObject(model.configuration, slotName, args)
}

function readConfObject(confObject, slotPath, args) {
  if (typeof slotPath === 'string') {
    const slot = confObject[slotPath]
    if (!slot) {
      return undefined
      // if we want to be very strict about config slots, we could uncomment the below
      // instead of returning undefine
      //
      // const modelType = getType(model)
      // const schemaType = model.configuration && getType(model.configuration)
      // throw new Error(
      //   `no slot "${slotName}" found in ${modelType.name} configuration (${
      //     schemaType.name
      //   })`,
      // )
    }
    if (slot.func) {
      const appliedFunc = slot.func.apply(null, args)
      if (isStateTreeNode(appliedFunc)) return getSnapshot(appliedFunc)
      return appliedFunc
    }
    if (isStateTreeNode(slot)) return getSnapshot(slot)
    return slot
  }

  const slotName = slotPath[0]
  if (slotPath.length > 1) {
    const newPath = slotPath.slice(1)
    const subConf = confObject[slotName]
    if (!subConf) return undefined
    return readConfObject(subConf, newPath, args)
  }
  return readConfObject(confObject, slotName, args)
}

export {
  ConfigurationSchema,
  ConfigurationReference,
  getModelConfig,
  getConf,
  readConfObject,
}
