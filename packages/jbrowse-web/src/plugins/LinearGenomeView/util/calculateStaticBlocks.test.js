import {
  calculateBlocksForward,
  calculateBlocksReversed,
} from './calculateStaticBlocks'

describe('block calculation', () => {
  it('can calculate some blocks 1', () => {
    const blocks = calculateBlocksForward({
      bpPerPx: 1,
      width: 800,
      offsetPx: 0,
      displayedRegions: [{ refName: 'ctgA', start: 0, end: 10000 }],
    })
    expect(blocks).toMatchSnapshot()
  })

  it('can calculate some blocks 2', () => {
    const blocks = calculateBlocksForward({
      bpPerPx: 1,
      width: 800,
      offsetPx: 30,
      displayedRegions: [
        { refName: 'ctgA', start: 0, end: 100 },
        { refName: 'ctgB', start: 100, end: 200 },
      ],
    })
    expect(blocks).toMatchSnapshot()
  })

  it('can calculate some blocks 3', () => {
    const blockSet = calculateBlocksForward({
      bpPerPx: 1,
      width: 800,
      offsetPx: 1000,
      displayedRegions: [
        { refName: 'ctgA', start: 0, end: 100 },
        { refName: 'ctgB', start: 100, end: 200 },
      ],
    })
    expect(blockSet.getBlocks()).toEqual([])
  })

  it('can calculate some blocks 4', () => {
    const blockSet = calculateBlocksForward(
      {
        bpPerPx: 1,
        width: 800,
        offsetPx: -1000,
        displayedRegions: [
          { refName: 'ctgA', start: 0, end: 100 },
          { refName: 'ctgB', start: 100, end: 200 },
        ],
      },
      {
        testEnv: true,
      },
    )
    expect(blockSet.getBlocks()).toEqual([])
  })

  it('can calculate some blocks 5', () => {
    const blocks = calculateBlocksForward({
      bpPerPx: 1,
      width: 800,
      offsetPx: 5000,
      displayedRegions: [
        { refName: 'ctgA', start: 0, end: 10000 },
        { refName: 'ctgB', start: 100, end: 10000 },
      ],
    })
    expect(blocks).toMatchSnapshot()
  })

  it('can calculate some blocks 6', () => {
    const blocks = calculateBlocksForward({
      bpPerPx: 1,
      width: 800,
      offsetPx: 0,
      displayedRegions: [
        { refName: 'ctgA', start: 0, end: 200 },
        { refName: 'ctgB', start: 0, end: 1000 },
      ],
    })
    expect(blocks).toMatchSnapshot()
  })

  it('can calculate some blocks 7', () => {
    const blocks = calculateBlocksForward({
      bpPerPx: 1,
      width: 800,
      offsetPx: 801,
      displayedRegions: [
        { refName: 'ctgA', start: 0, end: 200 },
        { refName: 'ctgB', start: 0, end: 1000 },
      ],
    })
    expect(blocks).toMatchSnapshot()
  })

  it('can calculate some blocks 8', () => {
    const blocks = calculateBlocksForward({
      bpPerPx: 1,
      width: 800,
      offsetPx: 1600,
      displayedRegions: [
        { refName: 'ctgA', start: 0, end: 200 },
        { refName: 'ctgB', start: 0, end: 10000000 },
      ],
      configuration: 'fakeReference',
    })
    expect(blocks).toMatchSnapshot()
  })

  it('can calculate some blocks 9', () => {
    const blocks = calculateBlocksForward({
      width: 800,
      offsetPx: 1069,
      bpPerPx: 2,
      displayedRegions: [
        { refName: 'ctgA', start: 0, end: 50000 },
        { refName: 'ctgB', start: 0, end: 300 },
      ],
      configuration: 'fakeReference',
    })
    expect(blocks).toMatchSnapshot()
  })
})

describe('reverse block calculation', () => {
  test('1', () => {
    const blocks = calculateBlocksReversed({
      bpPerPx: 1,
      width: 800,
      offsetPx: 0,
      displayedRegions: [{ refName: 'ctgA', start: 0, end: 10000 }],
    })
    expect(blocks).toMatchSnapshot()
  })
})
