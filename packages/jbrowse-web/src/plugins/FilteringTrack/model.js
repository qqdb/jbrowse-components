import { types } from 'mobx-state-tree'

import {
  ConfigurationReference,
  ConfigurationSchema,
} from '@gmod/jbrowse-core/configuration'

import { getParentRenderProps } from '@gmod/jbrowse-core/util/tracks'
import {
  basicTrackConfigSchemaFactory,
  basicTrackStateModelFactory,
} from '@gmod/jbrowse-plugin-linear-genome-view'
import FilteringTrackComponent from './components/FilteringTrack'

function makeFilters(trackModel) {
  const filters = []
  const { filterOut } = trackModel
  for (const attrName of filterOut.keys()) {
    for (const value of filterOut.get(attrName).keys()) {
      if (filterOut.get(attrName).get(value)) {
        filters.push(
          `function(f) { return String(f.get('${attrName}')) !== '${value}'}`,
        )
      }
    }
  }
  return filters
}

export default pluginManager => {
  const basicTrackConfigSchema = basicTrackConfigSchemaFactory(pluginManager)
  const basicTrackStateModel = basicTrackStateModelFactory(
    basicTrackConfigSchema,
  )

  const configSchema = ConfigurationSchema(
    'FilteringTrack',
    {
      filterAttributes: {
        type: 'stringArray',
        defaultValue: ['type'],
        description: 'list of feature attributes to use for filtering',
      },
    },
    {
      baseConfiguration: basicTrackConfigSchema,
      explicitlyTyped: true,
    },
  )

  const stateModel = types.compose(
    'FilteringTrack',
    basicTrackStateModel,
    types
      .model({
        type: types.literal('FilteringTrack'),
        configuration: ConfigurationReference(configSchema),
        hideExpressions: types.optional(types.array(types.string), () => []),
        height: 193,
        filterControlHeight: 70,
        dragHandleHeight: 3,
        filterOut: types.map(types.map(types.boolean)), // model[attrName][value] = true if filtering out
      })
      .views(self => ({
        get renderProps() {
          const filters = makeFilters(self)
          return {
            ...getParentRenderProps(self),
            trackModel: self,
            config: self.configuration.renderer,
            filters,
          }
        },
        get innerTrackHeight() {
          return self.height - self.dragHandleHeight - self.filterControlHeight
        },
      }))
      .actions(self => ({
        resizeFilterControls(distance) {
          self.filterControlHeight -= distance
        },
        toggleFilter(attrName, value, checked) {
          if (!self.filterOut.has(attrName)) self.filterOut.set(attrName, {})
          const values = self.filterOut.get(attrName)
          values.set(String(value), !checked)
        },
      }))
      .volatile(() => ({
        reactComponent: FilteringTrackComponent,
      })),
  )
  return { configSchema, stateModel }
}
