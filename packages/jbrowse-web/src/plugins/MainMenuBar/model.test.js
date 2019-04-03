import { types } from 'mobx-state-tree'
import { MenuItemModel, MainMenuBarModel } from './model'
import { ConfigurationSchema } from '../../configuration'

jest.mock('file-saver')

test('can export configuration', () => {
  const rootSchema = types.model({
    configuration: ConfigurationSchema('Toaster', {
      foo: { type: 'number', defaultValue: 42 },
    }),
    item: MenuItemModel,
  })

  const model = rootSchema.create({
    item: {
      name: 'export',
      callback: 'exportConfiguration',
    },
    configuration: {
      foo: 99,
    },
  })

  const jsonString = model.item.func()
  expect(jsonString).toContain('"foo": 99')
})

test('can push menus', () => {
  const menubar = MainMenuBarModel.create({ type: 'MainMenuBar' })
  menubar.pushMenu({
    name: 'Admin',
    menuItems: [
      {
        name: 'Export configuration',
        icon: 'get_app',
        callback: 'export',
      },
    ],
  })

  expect(menubar.menus.length).toBe(2)
  expect(menubar.menus.map(m => m.name)).toEqual(['Help', 'Admin'])
})

test('can unshift menus', () => {
  const menubar = MainMenuBarModel.create({ type: 'MainMenuBar' })
  menubar.unshiftMenu({
    name: 'Admin',
    menuItems: [
      {
        name: 'Export configuration',
        icon: 'get_app',
        callback: 'exportConfiguration',
      },
    ],
  })

  expect(menubar.menus.length).toBe(2)
  expect(menubar.menus.map(m => m.name)).toEqual(['Admin', 'Help'])
})
