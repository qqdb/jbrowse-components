import { BamFile } from '@gmod/bam'
import BaseAdapter, { BaseOptions } from '@gmod/jbrowse-core/BaseAdapter'
import { IFileLocation, IRegion } from '@gmod/jbrowse-core/mst-types'
import { checkAbortSignal } from '@gmod/jbrowse-core/util'
import { openLocation } from '@gmod/jbrowse-core/util/io'
import { ObservableCreate } from '@gmod/jbrowse-core/util/rxjs'
import { Feature } from '@gmod/jbrowse-core/util/simpleFeature'
import memoize from 'memoize-one'
import BamSlightlyLazyFeature from './BamSlightlyLazyFeature'

interface HeaderLine {
  tag: string
  value: string
}
interface Header {
  idToName: string[]
  nameToId: Record<string, number>
}

const setup = memoize(async (bam: BamFile) => {
  const samHeader = await bam.getHeader()

  // use the @SQ lines in the header to figure out the
  // mapping between ref ref ID numbers and names
  const idToName: string[] = []
  const nameToId: Record<string, number> = {}
  const sqLines = samHeader.filter((l: { tag: string }) => l.tag === 'SQ')
  sqLines.forEach((sqLine: { data: HeaderLine[] }, refId: number) => {
    sqLine.data.forEach((item: HeaderLine) => {
      if (item.tag === 'SN') {
        // this is the ref name
        const refName = item.value
        nameToId[refName] = refId
        idToName[refId] = refName
      }
    })
  })
  return { idToName, nameToId }
})

export default class extends BaseAdapter {
  private bam: BamFile

  private samHeader: Header = { idToName: [], nameToId: {} }

  public static capabilities = ['getFeatures', 'getRefNames']

  public constructor(config: {
    bamLocation: IFileLocation
    index: { location: IFileLocation; indexType: string }
  }) {
    super()
    const {
      bamLocation,
      index: { location, indexType },
    } = config

    this.bam = new BamFile({
      bamFilehandle: openLocation(bamLocation),
      csiFilehandle: indexType === 'CSI' ? openLocation(location) : undefined,
      baiFilehandle: indexType !== 'CSI' ? openLocation(location) : undefined,
    })
  }

  async getRefNames() {
    return (await setup(this.bam)).idToName
  }

  /**
   * Fetch features for a certain region. Use getFeaturesInRegion() if you also
   * want to verify that the store has features for the given reference sequence
   * before fetching.
   * @param {IRegion} param
   * @param {AbortSignal} [signal] optional signalling object for aborting the fetch
   * @returns {Observable[Feature]} Observable of Feature objects in the region
   */
  getFeatures(region: IRegion, opts: BaseOptions = {}) {
    return ObservableCreate<Feature>(async observer => {
      const { refName, start, end } = region
      this.samHeader = await setup(this.bam)
      const records = await this.bam.getRecordsForRange(
        refName,
        start,
        end,
        opts,
      )
      checkAbortSignal(opts.signal)

      records.forEach(record => {
        observer.next(new BamSlightlyLazyFeature(record, this))
      })
      observer.complete()
    })
  }

  /**
   * called to provide a hint that data tied to a certain region
   * will not be needed for the forseeable future and can be purged
   * from caches, etc
   */
  freeResources(/* { region } */): void {}

  // depends on setup being called before the BAM constructor
  refIdToName(refId: number): string | undefined {
    return this.samHeader.idToName[refId]
  }
}
