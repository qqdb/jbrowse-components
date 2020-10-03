import Plugin from '@gmod/jbrowse-core/Plugin'
import TrackType from '@gmod/jbrowse-core/pluggableElementTypes/TrackType'
import AdapterType from '@gmod/jbrowse-core/pluggableElementTypes/AdapterType'
import AddIcon from '@material-ui/icons/Add'
import { autorun } from 'mobx'
import PluginManager from '@gmod/jbrowse-core/PluginManager'
import {
  AbstractSessionModel,
  isAbstractMenuManager,
  getSession,
} from '@gmod/jbrowse-core/util'
import { getConf } from '@gmod/jbrowse-core/configuration'
import { Feature } from '@gmod/jbrowse-core/util/simpleFeature'
import TimelineIcon from '@material-ui/icons/Timeline'
// eslint-disable-next-line import/no-extraneous-dependencies
import { parseCigar } from '@gmod/jbrowse-plugin-alignments/src/BamAdapter/MismatchParser'
import { IAnyStateTreeNode } from 'mobx-state-tree'
import {
  configSchemaFactory as dotplotTrackConfigSchemaFactory,
  stateModelFactory as dotplotTrackStateModelFactory,
} from './DotplotTrack'
import DotplotRenderer, {
  configSchema as dotplotRendererConfigSchema,
  ReactComponent as DotplotRendererReactComponent,
} from './DotplotRenderer'

import {
  configSchema as PAFAdapterConfigSchema,
  AdapterClass as PAFAdapter,
} from './PAFAdapter'
import ComparativeRender from './DotplotRenderer/ComparativeRenderRpc'

interface Track {
  addAdditionalContextMenuItemCallback: Function
  additionalContextMenuItemCallbacks: Function[]
  id: string
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PileupTrack: any
}
interface View {
  tracks: Track[]
  views?: View[]
  type: string
}
interface Session {
  views: View[]
}
function getLengthOnRef(cigar: string) {
  const cigarOps = parseCigar(cigar)
  let lengthOnRef = 0
  for (let i = 0; i < cigarOps.length; i += 2) {
    const len = +cigarOps[i]
    const op = cigarOps[i + 1]
    if (op !== 'H' && op !== 'S' && op !== 'I') {
      lengthOnRef += len
    }
  }
  return lengthOnRef
}

function getLength(cigar: string) {
  const cigarOps = parseCigar(cigar)
  let length = 0
  for (let i = 0; i < cigarOps.length; i += 2) {
    const len = +cigarOps[i]
    const op = cigarOps[i + 1]
    if (op !== 'D' && op !== 'N') {
      length += len
    }
  }
  return length
}

function getLengthSansClipping(cigar: string) {
  const cigarOps = parseCigar(cigar)
  let length = 0
  for (let i = 0; i < cigarOps.length; i += 2) {
    const len = +cigarOps[i]
    const op = cigarOps[i + 1]
    if (op !== 'H' && op !== 'S' && op !== 'D' && op !== 'N') {
      length += len
    }
  }
  return length
}

function getClip(cigar: string, strand: number) {
  return strand === -1
    ? +(cigar.match(/(\d+)[SH]$/) || [])[1] || 0
    : +(cigar.match(/^(\d+)([SH])/) || [])[1] || 0
}

type IndexedRegion = {
  start: number
  end: number
  refName: string
  index: number
  assemblyName: string
}

interface ReducedFeature {
  refName: string
  start: number
  clipPos: number
  end: number
  seqLength: number
}

export default class DotplotPlugin extends Plugin {
  name = 'DotplotPlugin'

  install(pluginManager: PluginManager) {
    pluginManager.addViewType(() =>
      pluginManager.jbrequire(require('./DotplotView')),
    )
    pluginManager.addTrackType(() => {
      const configSchema = dotplotTrackConfigSchemaFactory(pluginManager)
      return new TrackType({
        name: 'DotplotTrack',
        compatibleView: 'DotplotView',
        configSchema,
        stateModel: dotplotTrackStateModelFactory(pluginManager, configSchema),
      })
    })

    pluginManager.addRendererType(
      () =>
        new DotplotRenderer({
          name: 'DotplotRenderer',
          configSchema: dotplotRendererConfigSchema,
          ReactComponent: DotplotRendererReactComponent,
        }),
    )

    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: 'PAFAdapter',
          configSchema: PAFAdapterConfigSchema,
          AdapterClass: PAFAdapter,
        }),
    )

    // install our comparative rendering rpc callback
    pluginManager.addRpcMethod(() => new ComparativeRender(pluginManager))
  }

  configure(pluginManager: PluginManager) {
    if (isAbstractMenuManager(pluginManager.rootModel)) {
      pluginManager.rootModel.appendToSubMenu(['File', 'Add'], {
        label: 'Dotplot view',
        icon: TimelineIcon,
        onClick: (session: AbstractSessionModel) => {
          session.addView('DotplotView', {})
        },
      })
    }

    const cb = (feature: Feature, track: IAnyStateTreeNode) => {
      return feature
        ? [
            {
              label: 'Dotplot of read vs ref',
              icon: AddIcon,
              onClick: () => {
                const session = getSession(track)
                const clipPos = feature.get('clipPos')
                const cigar = feature.get('CIGAR')
                const flags = feature.get('flags')
                const SA: string =
                  (feature.get('tags')
                    ? feature.get('tags').SA
                    : feature.get('SA')) || ''
                const readName = feature.get('name')
                const readAssembly = `${readName}_assembly`
                const trackAssembly = getConf(track, 'assemblyNames')[0]
                const assemblyNames = [trackAssembly, readAssembly]
                const trackId = `track-${Date.now()}`
                const trackName = `${readName}_vs_${trackAssembly}`
                const supplementaryAlignments = SA.split(';')
                  .filter(aln => !!aln)
                  .map((aln, index) => {
                    const [saRef, saStart, saStrand, saCigar] = aln.split(',')
                    const saLengthOnRef = getLengthOnRef(saCigar)
                    const saLength = getLength(saCigar)
                    const saLengthSansClipping = getLengthSansClipping(saCigar)
                    const saStrandNormalized = saStrand === '-' ? -1 : 1
                    const saClipPos = getClip(saCigar, saStrandNormalized)
                    const saRealStart = +saStart - 1 + saClipPos
                    return {
                      refName: saRef,
                      start: saRealStart,
                      end: saRealStart + saLengthOnRef,
                      seqLength: saLength,
                      clipPos: saClipPos,
                      CIGAR: saCigar,
                      assemblyName: trackAssembly,
                      strand: saStrandNormalized,
                      uniqueId: `${feature.id()}_SA${index}`,
                      mate: {
                        start: saClipPos,
                        end: saClipPos + saLengthSansClipping,
                        refName: readName,
                      },
                    }
                  })

                const feat = feature.toJSON()
                feat.mate = {
                  refName: readName,
                  start: clipPos,
                  end: clipPos + getLengthSansClipping(cigar),
                }

                // if secondary alignment or supplementary, calculate length from SA[0]'s CIGAR
                // which is the primary alignments. otherwise it is the primary alignment just use
                // seq.length if primary alignment
                const totalLength =
                  // eslint-disable-next-line no-bitwise
                  flags & 2048
                    ? getLength(supplementaryAlignments[0].CIGAR)
                    : getLength(cigar)

                const features = [
                  feat,
                  ...supplementaryAlignments,
                ] as ReducedFeature[]

                features.sort((a, b) => a.clipPos - b.clipPos)

                const refLength = features.reduce(
                  (a, f) => a + f.end - f.start,
                  0,
                )

                function mergeIntervals(intervals: any) {
                  // test if there are at least 2 intervals
                  if (intervals.length <= 1) return intervals

                  const stack = []
                  let top = null

                  // sort the intervals based on their start values
                  intervals = intervals.sort((a, b) => a - b)

                  // push the 1st interval into the stack
                  stack.push(intervals[0])

                  // start from the next interval and merge if needed
                  for (let i = 1; i < intervals.length; i++) {
                    // get the top element
                    top = stack[stack.length - 1]

                    // if the current interval doesn't overlap with the
                    // stack top element, push it to the stack
                    if (top.end < intervals[i].start) {
                      stack.push(intervals[i])
                    }
                    // otherwise update the end value of the top element
                    // if end of current interval is higher
                    else if (top.end < intervals[i].end) {
                      top.end = intervals[i].end
                      stack.pop()
                      stack.push(top)
                    }
                  }

                  return stack
                }

                function groupBy(arr, property) {
                  return arr.reduce(function (memo, x) {
                    if (!memo[x[property]]) {
                      memo[x[property]] = []
                    }
                    memo[x[property]].push(x)
                    return memo
                  }, {})
                }
                function gatherOverlaps(regions: IndexedRegion[]) {
                  const groups = groupBy(regions, 'refName')
                  const merged = Object.values(groups).map(group => {
                    group.sort((a, b) => a.start - b.start)
                    return mergeIntervals(group)
                  })

                  const r = merged.flat().sort((a, b) => a.index - b.index)
                  console.log({ r })
                  return r
                }

                session.addView('DotplotView', {
                  type: 'DotplotView',
                  hview: {
                    offsetPx: 0,
                    bpPerPx: refLength / 800,
                    displayedRegions: gatherOverlaps(
                      features.map((f, index) => {
                        const { start, end, refName } = f
                        return {
                          start,
                          end,
                          refName,
                          index,
                          assemblyName: trackAssembly,
                        }
                      }),
                    ),
                  },
                  vview: {
                    offsetPx: 0,
                    bpPerPx: totalLength / 400,
                    displayedRegions: [
                      {
                        assemblyName: readAssembly,
                        start: 0,
                        end: totalLength,
                        refName: readName,
                      },
                    ],
                  },
                  viewTrackConfigs: [
                    {
                      type: 'DotplotTrack',
                      assemblyNames,
                      adapter: {
                        type: 'FromConfigAdapter',
                        features,
                      },
                      trackId,
                      name: trackName,
                    },
                  ],
                  viewAssemblyConfigs: [
                    {
                      name: readAssembly,
                      sequence: {
                        type: 'ReferenceSequenceTrack',
                        trackId: `${readName}_${Date.now()}`,
                        adapter: {
                          type: 'FromConfigSequenceAdapter',
                          features: [feature.toJSON()],
                        },
                      },
                    },
                  ],
                  assemblyNames,
                  tracks: [
                    {
                      configuration: trackId,
                      type: 'DotplotTrack',
                    },
                  ],
                  displayName: `${readName} vs ${trackAssembly}`,
                })
              },
            },
          ]
        : []
    }
    function addContextMenu(view: View) {
      if (view.type === 'LinearGenomeView') {
        view.tracks.forEach(track => {
          if (
            track.type === 'PileupTrack' &&
            !track.additionalContextMenuItemCallbacks.includes(cb)
          ) {
            track.addAdditionalContextMenuItemCallback(cb)
          } else if (
            track.type === 'AlignmentsTrack' &&
            track.PileupTrack &&
            !track.PileupTrack.additionalContextMenuItemCallbacks.includes(cb)
          ) {
            track.PileupTrack.addAdditionalContextMenuItemCallback(cb)
          }
        })
      }
    }
    autorun(() => {
      const session = pluginManager.rootModel?.session as Session | undefined
      if (session) {
        session.views.forEach(view => {
          if (view.views) {
            view.views.forEach(v => addContextMenu(v))
          } else {
            addContextMenu(view)
          }
        })
      }
    })
  }
}
