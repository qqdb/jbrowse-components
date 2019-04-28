import { types } from 'mobx-state-tree'
import Plugin from '@gmod/jbrowse-core/Plugin'
import AdapterType from '@gmod/jbrowse-core/pluggableElementTypes/AdapterType'
import { ConfigurationSchema } from '@gmod/jbrowse-core/configuration'
import AdapterClass from './BamAdapter'

const configSchema = ConfigurationSchema(
  'BamAdapter',
  {
    bamLocation: {
      type: 'fileLocation',
      defaultValue: { uri: '/path/to/my.bam' },
    },
    index: ConfigurationSchema('BamIndex', {
      indexType: {
        model: types.enumeration('IndexType', ['BAI', 'CSI']),
        type: 'stringEnum',
        defaultValue: 'BAI',
      },
      location: {
        type: 'fileLocation',
        defaultValue: { uri: '/path/to/my.bam.bai' },
      },
    }),
  },
  { explicitlyTyped: true },
)

export default class BamAdapterPlugin extends Plugin {
  install(pluginManager) {
    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: 'BamAdapter',
          configSchema,
          AdapterClass,
        }),
    )
  }
}
