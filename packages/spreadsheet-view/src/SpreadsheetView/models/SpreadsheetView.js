export default pluginManager => {
  const { jbrequire } = pluginManager
  const { types, getParent, getRoot, getEnv } = jbrequire('mobx-state-tree')
  const { ElementId } = jbrequire('@gmod/jbrowse-core/mst-types')
  const { ConfigurationSchema } = jbrequire('@gmod/jbrowse-core/configuration')

  const SpreadsheetModel = jbrequire(require('./Spreadsheet'))
  const ImportWizardModel = jbrequire(require('./ImportWizard'))
  const FilterControlsModel = jbrequire(require('./FilterControls'))

  const configSchema = ConfigurationSchema(
    'SpreadsheetView',
    {},
    { explicitlyTyped: true },
  )

  const minHeight = 40
  const defaultHeight = 400
  const stateModel = types
    .model('SpreadsheetView', {
      id: ElementId,
      type: types.literal('SpreadsheetView'),
      offsetPx: 0,
      width: 800,
      height: types.optional(
        types.refinement(
          'SpreadsheetViewHeight',
          types.number,
          n => n >= minHeight,
        ),
        defaultHeight,
      ),
      configuration: configSchema,

      filterControls: types.optional(FilterControlsModel, () =>
        FilterControlsModel.create({ filters: [{ type: 'Text' }] }),
      ),

      // switch specifying whether we are showing the import wizard or the spreadsheet in our viewing area
      mode: types.optional(
        types.enumeration('SpreadsheetViewMode', ['import', 'display']),
        'import',
      ),
      importWizard: types.optional(ImportWizardModel, () =>
        ImportWizardModel.create(),
      ),
      spreadsheet: types.maybe(SpreadsheetModel),
    })
    .views(self => ({
      get readyToDisplay() {
        return !!self.spreadsheet
      },

      get hideRowSelection() {
        return !!getEnv(self).hideRowSelection
      },

      get selectedRows() {
        return self.rowSet.selectedRows
      },
    }))
    .actions(self => ({
      setWidth(newWidth) {
        self.width = newWidth
      },
      setHeight(newHeight) {
        if (newHeight > minHeight) self.height = newHeight
        else self.height = minHeight
        return self.height
      },
      resizeHeight(distance) {
        const oldHeight = self.height
        const newHeight = self.setHeight(self.height + distance)
        return newHeight - oldHeight
      },

      // load a new spreadsheet and set our mode to display it
      displaySpreadsheet(spreadsheet) {
        self.spreadsheet = spreadsheet
        self.mode = 'display'
      },

      setImportMode() {
        self.mode = 'import'
      },

      setDisplayMode() {
        if (self.readyToDisplay) self.mode = 'display'
      },

      closeView() {
        getParent(self, 2).removeView(self)
      },

      activateConfigurationUI() {
        getRoot(self).editConfiguration(self.configuration)
      },
    }))

  return { stateModel, configSchema }
}