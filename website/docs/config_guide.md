---
id: config_guide
title: Config guide
toplevel: true
---

## Intro to the config.json

A JBrowse 2 configuration file, a config.json, is structured as follows

```json
{
  "configuration": {
    /* global configs here */
  },
  "assemblies": [
    /* list of assembly configurations, e.g. the genomes being viewed */
  ],
  "tracks": [
    /* array of tracks being loaded, contain reference to which assembl(ies)
    they belong to */
  ],
  "defaultSession": {
    /* optional default session */
  },
  "savedSessions": [
    /* optional saved sessions */
  ]
}
```

The most important thing to configure are your assemblies and your tracks

### Configuring assemblies

An assembly configuration includes the "name" of your assembly, any "aliases"
that might be associated with that assembly e.g. GRCh37 is sometimes seen as an
alias for hg19, and then a "sequence" configuration containing a reference
sequence track config. This is provides a special "track" that is outside the
normal track config

Here is a complete config.json file containing only a hg19

```json
{
  "assemblies": [
    {
      "name": "hg19",
      "aliases": ["GRCh37"],
      "sequence": {
        "type": "ReferenceSequenceTrack",
        "trackId": "hg19_config",
        "adapter": {
          "type": "BgzipFastaAdapter",
          "fastaLocation": {
            "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz"
          },
          "faiLocation": {
            "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.fai"
          },
          "gziLocation": {
            "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.gzi"
          }
        },
        "rendering": {
          "type": "DivSequenceRenderer"
        }
      },
      "refNameAliases": {
        "adapter": {
          "type": "RefNameAliasAdapter",
          "location": {
            "uri": "https://s3.amazonaws.com/jbrowse.org/genomes/hg19/hg19_aliases.txt"
          }
        }
      }
    }
  ]
}
```

## Configuring reference name aliasing

Reference name aliasing is a process to make chromosomes that are named slighlty
differently but which refer to the same thing render properly

The refNameAliases in the above config provides this functionality

```
"refNameAliases": {
  "adapter": {
    "type": "RefNameAliasAdapter",
    "location": {
      "uri": "https://s3.amazonaws.com/jbrowse.org/genomes/hg19/hg19_aliases.txt"
    }
  }
}
```

The hg19_aliases then is a tab delimited file that looks like this

The first column should be the names that are in your FASTA sequence, and the
rest of the columns are aliases

```
1	chr1
2	chr2
3	chr3
4	chr4
5	chr5
6	chr6
7	chr7
8	chr8
9	chr9
10	chr10
11	chr11
12	chr12
13	chr13
14	chr14
15	chr15
16	chr16
17	chr17
18	chr18
19	chr19
20	chr20
21	chr21
22	chr22
X	chrX
Y	chrY
M	chrM	MT
```

## Adding an assembly with the CLI

Generally we add a new assembly with the CLI using something like

```
# use samtools to make a fasta index for your reference genome
samtools faidx myfile.fa

# install the jbrowse CLI
npm install -g @jbrowse/cli

# add the assembly using the jbrowse CLI, this will automatically copy the
myfile.fa and myfile.fa.fai to your data folder at /var/www/html/jbrowse2
jbrowse add-assembly myfile.fa --load copy --out /var/www/html/jbrowse2
```

See our CLI docs for the add-assembly for more details here -- [add-assembly](cli#jbrowse-add-assembly-sequence)

## Track configurations

All tracks can contain

- trackId - internal track ID, must be unique
- name - displayed track name
- assemblyNames - an array of assembly names a track is associated with, often
  just a single assemblyName
- category - (optional) array of categories to display in a hierarchical track
  selector

Example config.json containing a track config

```json
{
  "assemblies": [
    {
      "name": "hg19",
      "aliases": ["GRCh37"],
      "sequence": {
        "type": "ReferenceSequenceTrack",
        "trackId": "hg19_config",
        "adapter": {
          "type": "BgzipFastaAdapter",
          "fastaLocation": {
            "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz"
          },
          "faiLocation": {
            "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.fai"
          },
          "gziLocation": {
            "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.gzi"
          }
        },
        "rendering": {
          "type": "DivSequenceRenderer"
        }
      },
      "refNameAliases": {
        "adapter": {
          "type": "RefNameAliasAdapter",
          "location": {
            "uri": "https://s3.amazonaws.com/jbrowse.org/genomes/hg19/hg19_aliases.txt"
          }
        }
      }
    }
  ],
  "tracks": [
    {
      "type": "BasicTrack",
      "trackId": "ncbi_gff_hg19",
      "name": "NCBI RefSeq (GFF3Tabix)",
      "assemblyNames": ["hg19"],
      "category": ["Annotation test", "blah"],
      "adapter": {
        "type": "Gff3TabixAdapter",
        "gffGzLocation": {
          "uri": "https://s3.amazonaws.com/jbrowse.org/genomes/hg19/GRCh37_latest_genomic.sort.gff.gz"
        },
        "index": {
          "location": {
            "uri": "https://s3.amazonaws.com/jbrowse.org/genomes/hg19/GRCh37_latest_genomic.sort.gff.gz.tbi"
          }
        }
      },
      "renderer": {
        "type": "SvgFeatureRenderer"
      }
    }
  ]
}
```

- minScore - the minimum score to plot in the coverage track. default: 0
- maxScore - the maximum score to plot in the coverage track. default: auto calculated
- scaleType - options: linear, log, to display the coverage data
- adapter - this corresponds to a BamAdapter or CramAdapter or any other
  adapter type that returns alignments-like features

Example AlignmentsTrack config

```json
{
  "trackId": "my_alignments_track",
  "name": "My Alignments",
  "assemblyNames": ["hg19"],
  "type": "AlignmentsTrack",
  "adapter": {
    "type": "BamAdapter",
    "bamLocation": { "uri": "http://yourhost/file.bam" },
    "index": { "location": { "uri": "http://yourhost/file.bam.bai" } }
  }
}
```

### PileupTrack configuration options

Note: an AlignmentsTrack automatically sets up a PileupTrack as a subtrack, so
it is not common to use PileupTrack individually, but it is allowed

- adapter - either gets it's adapter from the parent alignmentstrack or can be
  configured as any adapter that returns alignments-like features
- defaultRendering - options: pileup, svg. default: pileup

Example PileupTrack config

```json
{
  "trackId": "my_pileup_track",
  "name": "My Alignments",
  "assemblyNames": ["hg19"],
  "type": "PileupTrack",
  "adapter": {
    "type": "BamAdapter",
    "bamLocation": { "uri": "http://yourhost/file.bam" },
    "index": { "location": { "uri": "http://yourhost/file.bam.bai" } }
  }
}
```

### SNPCoverageTrack configuration options

Note: an AlignmentsTrack automatically sets up a SNPCoverageTrack as a subtrack,
so it is not common to configure SNPCoverageTrack individually, but it is allowed

- autoscale: local. this is the only currently allowed option
- minScore - the minimum score to plot in the coverage track. default: 0
- maxScore - the maximum score to plot in the coverage track. default: auto calculated
- scaleType - options: linear, log, to display the coverage data
- inverted - boolean option to draw coverage draw upside down. default: false
- adapter - either gets it's adapter from the parent alignmentstrack or can be
  configured as any adapter that returns alignments-like features

Example SNPCoverageTrack config

```json
{
  "trackId": "my_snpcov_track",
  "name": "My Alignments",
  "assemblyNames": ["hg19"],
  "type": "SNPCoverageTrack",
  "adapter": {
    "type": "BamAdapter",
    "bamLocation": { "uri": "http://yourhost/file.bam" },
    "index": { "location": { "uri": "http://yourhost/file.bam.bai" } }
  }
}
```

### BamAdapter configuration options

- bamLocation - a 'file location' for the BAM
- index: a subconfigurations chema containing
  - indexType: options BAI or CSI. default BAI
  - location: the location of the index

Example BamAdapter config

```json
{
  "type": "BamAdapter",
  "bamLocation": { "uri": "http://yourhost/file.bam" },
  "index": { "location": { "uri": "http://yourhost/file.bam.bai" } }
}
```

### CramAdapter configuration options

- cramLocation - a 'file location' for the CRAM
- craiLocation - a 'file location' for the CRAI

Example CramAdapter config

```json
{
  "type": "CramAdapter",
  "cramLocation": { "uri": "http://yourhost/file.cram" },
  "craiLocation": { "uri": "http://yourhost/file.cram.crai" }
}
```

## Assembly config

Because JBrowse 2 can potentially have multiple assemblies loaded at once, it
needs to make sure each track is associated with an assembly.

To do this, we make assemblies a special part of the config, and make sure each
track refers to which genome assembly it uses

### Example config with hg19 genome assembly loaded

Here is a complete config.json that has the hg19 genome loaded

```json
{
  "assemblies": [
    {
      "name": "hg19",
      "aliases": ["GRCh37"],
      "sequence": {
        "type": "ReferenceSequenceTrack",
        "trackId": "refseq_track",
        "adapter": {
          "type": "BgzipFastaAdapter",
          "fastaLocation": {
            "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz"
          },
          "faiLocation": {
            "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.fai"
          },
          "gziLocation": {
            "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.gzi"
          }
        },
        "rendering": {
          "type": "DivSequenceRenderer"
        }
      },
      "refNameAliases": {
        "adapter": {
          "type": "RefNameAliasAdapter",
          "location": {
            "uri": "https://s3.amazonaws.com/jbrowse.org/genomes/hg19/hg19_aliases.txt"
          }
        }
      }
    }
  ]
}
```

The top level config is an array of assemblies

Each assembly contains

- name - a name to refer to the assembly by. each track that is related to this
  assembly references this name
- aliases - sometimes genome assemblies have aliases like hg19, GRCh37, b37p5,
  etc. while there may be small differences between these assembly alias
  sequences, they often largely have the same coordinates, so you might want to
  be able to associate tracks from these different assemblies together. this is
  most commonly helpful when loading from a UCSC trackHub which specifies the
  genome assembly names it uses, so you can connect to a UCSC trackHub if your
  assembly name or aliases match.
- sequence - this is a complete "track" definition for your genome assembly. we
  specify that it is a track of type ReferenceSequenceTrack, give it a trackId,
  and an adapter configuration. an adapter configuration can specify
  IndexedFastaAdapter (fasta.fa and fasta.fai), BgzipFastaAdapter (fasta.fa.gz,
  fasta.fa.gz.fai, fasta.gz.gzi), ChromSizesAdapter (which fetches no
  sequences, just chromosome names)

### ReferenceSequenceTrack

Example ReferenceSequenceTrack config, which as above, is specified as the
child of the assembly section of the config

```json
{
  "type": "ReferenceSequenceTrack",
  "trackId": "refseq_track",
  "adapter": {
    "type": "BgzipFastaAdapter",
    "fastaLocation": {
      "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz"
    },
    "faiLocation": {
      "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.fai"
    },
    "gziLocation": {
      "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.gzi"
    }
  },
  "rendering": {
    "type": "DivSequenceRenderer"
  }
}
```

### BgzipFastaAdapter

A bgzip FASTA format file is generated by

```sh
bgzip -i sequence.fa
samtools faidx sequence.fa.gz

## above commands generate three files
sequence.fa.gz
sequence.fa.gz.gzi
sequence.fa.gz.fai
```

These are loaded into a BgzipFastaAdapter as follows

```json
{
  "type": "BgzipFastaAdapter",
  "fastaLocation": {
    "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz"
  },
  "faiLocation": {
    "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.fai"
  },
  "gziLocation": {
    "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.gzi"
  }
}
```

### IndexedFastaAdapter

An indexed FASTA file is similar to the above, but the sequence is not compressed

```sh
samtools faidx sequence.fa

## above commands generate three files
sequence.fa
sequence.fa.fai
```

These are loaded into a IndexedFastaAdapter as follows

```json
{
  "type": "IndexedFastaAdapter",
  "fastaLocation": {
    "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa"
  },
  "faiLocation": {
    "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.fai"
  }
}
```

### TwoBitAdapter

The UCSC twoBit adapter is also supported. Note however that the 2bit format
has a longer startup time than other adapters because there is a larger upfront
parsing time.

```json
{
  "type": "TwoBitAdapter",
  "twoBitLocation": {
    "uri": "https://jbrowse.org/genomes/hg19/fasta/hg19.2bit"
  }
}
```

## DotplotView configuration

### Setup

An example of a dotplot config can help explain. This is relatively advanced so
let's step through it

1. We setup two assemblies, one for grape, one for peach (only chrom.sizes
   files used)
2. Then we setup a "dotplot track" because multiple layers can be plotted on a
   dotplot. We use a PAFAdapter
3. Then we instantiate a savedSession containing the whole genome, by setting
   displayedRegions to be empty

```json
{
  "assemblies": [
    {
      "name": "grape",
      "sequence": {
        "trackId": "grape_seq",
        "type": "ReferenceSequenceTrack",
        "adapter": {
          "type": "ChromSizesAdapter",
          "chromSizesLocation": {
            "uri": "test_data/grape.chrom.sizes"
          }
        }
      }
    },
    {
      "name": "peach",
      "sequence": {
        "trackId": "peach_seq",
        "type": "ReferenceSequenceTrack",
        "adapter": {
          "type": "ChromSizesAdapter",
          "chromSizesLocation": {
            "uri": "test_data/peach.chrom.sizes"
          }
        }
      }
    }
  ],
  "tracks": [
    {
      "type": "DotplotTrack",
      "trackId": "dotplot_track",
      "name": "dotplot",
      "assemblyNames": ["grape", "peach"],
      "adapter": {
        "type": "PAFAdapter",
        "pafLocation": {
          "uri": "test_data/peach_grape.paf"
        },
        "assemblyNames": ["peach", "grape"]
      },
      "renderer": {
        "type": "DotplotRenderer"
      }
    }
  ],
  "defaultSession": {
    "name": "Grape vs Peach",
    "views": [
      {
        "id": "dotplotview",
        "type": "DotplotView",
        "assemblyNames": ["peach", "grape"],
        "hview": {
          "displayedRegions": [],
          "bpPerPx": 100000,
          "offsetPx": 0
        },
        "vview": {
          "displayedRegions": [],
          "bpPerPx": 100000,
          "offsetPx": 0
        },
        "tracks": [
          {
            "type": "DotplotTrack",
            "configuration": "dotplot_track"
          }
        ],
        "height": 600,
        "displayName": "Grape vs Peach dotplot",
        "trackSelectorType": "hierarchical"
      }
    ]
  }
}
```

### DotplotView notes

The dotplot view is still very new, and parts of this config could change in
the future

Note that configuring the dotplot involves creating a "defaultSession"

Users can also open synteny views using the File->Add->Dotplot view workflow

## LinearSyntenyView configuration

Currently, configuring synteny is made by pre-configuring a session in the view
and adding synteny tracks

In order to configure linear synteny views, generally we will use PAF tracks

We can add a LinearSyntenyTrack from PAF with the CLI e.g. with

    jbrowse add-track myfile.paf --type LinearSyntenyTrack --assemblyNames \
        grape,peach --load copy --out /var/www/html/jbrowse2

This will copy the myfile.paf to your jbrowse2 installation at
/var/www/html/jbrowse2, it says column 1 of the PAF is grape and column 2 of
the PAF is peach, and it loads it as a LinearSyntenyTrack

### LinearSyntenyView with MCScanAnchorsAdapter

This is a complete synteny view config with a default session that is
preconfigured for grape vs peach. It contains a LinearSyntenyTrack using
MCScanAnchorsAdapter for grape and peach, which requires has subadapters that
refer to the reference gene tracks of peach and grape

```json
{
  "defaultSession": {
    "name": "New Session",
    "menuBars": [
      {
        "type": "MainMenuBar"
      }
    ]
  },
  "defaultSession": {
    "name": "Grape vs Peach Demo",
    "drawerWidth": 384,
    "views": [
      {
        "type": "LinearSyntenyView",
        "id": "test1",
        "headerHeight": 44,
        "datasetName": "grape_vs_peach_dataset",
        "tracks": [
          {
            "type": "LinearSyntenyTrack",
            "height": 100,
            "configuration": "grape_peach_synteny_mcscan"
          }
        ],
        "height": 400,
        "displayName": "Grape vs Peach",
        "trackSelectorType": "hierarchical",
        "views": [
          {
            "type": "LinearGenomeView",
            "id": "test1_1",
            "offsetPx": 28249,
            "bpPerPx": 1000,
            "displayedRegions": [
              {
                "refName": "Pp01",
                "assemblyName": "peach",
                "start": 0,
                "end": 100000000
              }
            ],
            "tracks": [
              {
                "type": "BasicTrack",
                "height": 100,
                "configuration": "peach_genes",
                "selectedRendering": ""
              }
            ],
            "hideControls": false,
            "hideHeader": true,
            "hideCloseButton": true,
            "trackSelectorType": "hierarchical"
          },
          {
            "type": "LinearGenomeView",
            "id": "test1_2",
            "offsetPx": 0,
            "bpPerPx": 1000,
            "displayedRegions": [
              {
                "refName": "chr1",
                "assemblyName": "grape",
                "start": 0,
                "end": 100000000
              }
            ],
            "tracks": [
              {
                "type": "BasicTrack",
                "height": 100,
                "configuration": "grape_genes",
                "selectedRendering": ""
              }
            ],
            "hideControls": false,
            "hideHeader": true,
            "hideCloseButton": true,
            "trackSelectorType": "hierarchical"
          }
        ]
      }
    ],
    "widgets": {
      "hierarchicalTrackSelector": {
        "id": "hierarchicalTrackSelector",
        "type": "HierarchicalTrackSelectorWidget",
        "collapsed": {},
        "filterText": ""
      },
      "sessionManager": {
        "id": "sessionManager",
        "type": "SessionManager"
      }
    },
    "activeWidgets": {},
    "connections": {}
  },
  "assemblies": [
    {
      "name": "grape",
      "sequence": {
        "trackId": "grape_seq",
        "type": "ReferenceSequenceTrack",
        "adapter": {
          "type": "ChromSizesAdapter",
          "chromSizesLocation": {
            "uri": "grape.chrom.sizes"
          }
        },
        "rendering": {
          "type": "DivSequenceRenderer"
        }
      }
    },
    {
      "name": "peach",
      "sequence": {
        "trackId": "peach_seq",
        "type": "ReferenceSequenceTrack",
        "adapter": {
          "type": "ChromSizesAdapter",
          "chromSizesLocation": {
            "uri": "peach.chrom.sizes"
          }
        },
        "rendering": {
          "type": "DivSequenceRenderer"
        }
      }
    }
  ],
  "tracks": [
    {
      "trackId": "grape_peach_synteny_mcscan",
      "type": "LinearSyntenyTrack",
      "assemblyNames": ["peach", "grape"],
      "trackIds": [],
      "renderDelay": 100,
      "adapter": {
        "mcscanAnchorsLocation": {
          "uri": "grape.peach.anchors"
        },
        "subadapters": [
          {
            "type": "NCListAdapter",
            "rootUrlTemplate": {
              "uri": "https://jbrowse.org/genomes/synteny/peach_gene/{refseq}/trackData.json"
            }
          },
          {
            "type": "NCListAdapter",
            "rootUrlTemplate": {
              "uri": "https://jbrowse.org/genomes/synteny/grape_gene/{refseq}/trackData.json"
            }
          }
        ],
        "assemblyNames": ["peach", "grape"],
        "type": "MCScanAnchorsAdapter"
      },
      "renderer": {
        "type": "LinearSyntenyRenderer"
      },
      "name": "Grape peach synteny (MCScan)",
      "category": ["Annotation"]
    },
    {
      "trackId": "peach_genes",
      "type": "BasicTrack",
      "assemblyNames": ["peach"],
      "name": "mcscan",
      "category": ["Annotation"],
      "adapter": {
        "type": "NCListAdapter",
        "rootUrlTemplate": {
          "uri": "https://jbrowse.org/genomes/synteny/peach_gene/{refseq}/trackData.json"
        }
      },
      "renderer": {
        "type": "PileupRenderer"
      }
    },
    {
      "trackId": "grape_genes",
      "type": "BasicTrack",
      "name": "mcscan",
      "assemblyNames": ["grape"],
      "category": ["Annotation"],
      "adapter": {
        "type": "NCListAdapter",
        "rootUrlTemplate": {
          "uri": "https://jbrowse.org/genomes/synteny/grape_gene/{refseq}/trackData.json"
        }
      },
      "renderer": {
        "type": "PileupRenderer"
      }
    }
  ]
}
```

### LinearSyntenyView with PAFAdapter

```
{
  "assemblies": [
    {
      "name": "grape",
      "sequence": {
        "trackId": "grape_seq",
        "type": "ReferenceSequenceTrack",
        "adapter": {
          "type": "ChromSizesAdapter",
          "chromSizesLocation": {
            "uri": "grape.chrom.sizes"
          }
        },
        "rendering": {
          "type": "DivSequenceRenderer"
        }
      }
    },
    {
      "name": "peach",
      "sequence": {
        "trackId": "peach_seq",
        "type": "ReferenceSequenceTrack",
        "adapter": {
          "type": "ChromSizesAdapter",
          "chromSizesLocation": {
            "uri": "peach.chrom.sizes"
          }
        },
        "rendering": {
          "type": "DivSequenceRenderer"
        }
      }
    }
  ],
  "tracks": [
    {
      "trackId": "grape_peach_synteny_linear_paf",
      "type": "LinearSyntenyTrack",
      "assemblyNames": ["peach", "grape"],
      "trackIds": [],
      "renderDelay": 100,
      "adapter": {
        "type": "PAFAdapter",
        "pafLocation": {
          "uri": "https://s3.amazonaws.com/jbrowse.org/genomes/synteny/peach_grape.paf"
        },
        "assemblyNames": ["peach", "grape"]
      },
      "renderer": {
        "type": "LinearSyntenyRenderer",
        "color": "#00fa"
      },
      "name": "Grape peach synteny (PAF)",
      "category": ["Annotation"]
    }
  ],
  "defaultSession": {
    "name": "Grape vs Peach (small)",
    "views": [
      {
        "id": "MiDMyyWpp",
        "type": "LinearSyntenyView",
        "height": 400,
        "displayName": "Grape vs Peach dotplot",
        "trackSelectorType": "hierarchical",
        "showIntraviewLinks": true,
        "linkViews": false,
        "interactToggled": false,
        "tracks": [
          {
            "id": "YzHQQgj77",
            "type": "LinearSyntenyTrack",
            "height": 100,
            "configuration": "grape_peach_synteny_linear_paf"
          }
        ],
        "views": [
          {
            "id": "test1_1",
            "type": "LinearGenomeView",
            "offsetPx": 28249,
            "bpPerPx": 1000,
            "displayedRegions": [
              {
                "refName": "Pp01",
                "start": 0,
                "end": 100000000,
                "reversed": false,
                "assemblyName": "peach"
              }
            ],
            "tracks": [],
            "hideHeader": true,
            "hideHeaderOverview": false,
            "trackSelectorType": "hierarchical",
            "trackLabels": "overlapping",
            "showCenterLine": false
          },
          {
            "id": "test1_2",
            "type": "LinearGenomeView",
            "offsetPx": 0,
            "bpPerPx": 1000,
            "displayedRegions": [
              {
                "refName": "chr1",
                "start": 0,
                "end": 100000000,
                "reversed": false,
                "assemblyName": "grape"
              }
            ],
            "tracks": [],
            "hideHeader": true,
            "hideHeaderOverview": false,
            "trackSelectorType": "hierarchical",
            "trackLabels": "overlapping",
            "showCenterLine": false
          }
        ],
      }
    ]
  }
}

```

### LinearSyntenyView notes

The linear synteny view is still very new, and parts of this config could
change in the future

Note that configuring the dotplot involves creating a "defaultSession"

Users can also open synteny views using the File->Add->Linear synteny view
workflow

## Configuring the theme

### Color

The color scheme as well as some sizing options can be configured via the theme.
This is done via a top-level configuration in the config file. For example:

```json
{
  "configuration": {
    "theme": {
      "palette": {
        "primary": {
          "main": "#4400a6"
        }
      }
    }
  }
}
```

JBrowse uses 4 colors that can be changed. For example, this is the default
theme:

![JBrowse using the default theme](./img/default_theme.png)
Example of the default theme

![JBrowse using a customized theme](./img/customized_theme.png)
Example of a customized theme

The customized theme screenshot uses the below configuration

|            | Color code | Color       |
| ---------- | ---------- | ----------- |
| Primary    | #311b92    | Deep purple |
| Secondary  | #0097a7    | Cyan        |
| Tertiary   | #f57c00    | Orange      |
| Quaternary | #d50000    | Red         |

```json
{
  "configuration": {
    "theme" :{
      "palette": {
        "primary": {
          "main": "#311b92"
        },
        "secondary": {
          "main": "#0097a7"
        },
        "tertiary": {
          "main": "#f57c00"
        },
        "quaternary": {
          "main": "#d50000"
        }
      }
    }
  }
```

### Sizing

You can also change some sizing options by specifying the "typography" (to
change font size) and "spacing" (to change the amount of space between elements)
options:

```json
{
  "theme": {
    "typography": { "fontSize": 10 },
    "spacing": 2
  }
}
```

### Advanced

JBrowse uses Material-UI for its theming. You can read more about Material-UI
themes [here](https://material-ui.com/customization/theming/). Generally, most
options you could pass to Material-UI's
[`createMuiTheme`](https://material-ui.com/customization/theming/#createmuitheme-options-args-theme)
should work in the theme configuration.

## HicTrack config

Example Hi-C track config

````json
{
  "type": "HicTrack",
  "trackId": "hic",
  "name": "Hic Track",
  "assemblyNames": ["hg19"],
  "adapter": {
    "type": "HicAdapter",
    "hicLocation": {
      "uri": "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic"
    }
  },
  "renderer": {
    "type": "HicRenderer",
    "baseColor": "blue"
  }
}
```

### HicAdapter config

We just simply supply a hicLocation currently for the HicAdapter

```json

{
  "type": "HicAdapter",
  "hicLocation": {
    "uri": "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic"
  }
}

```

### HicRenderer config

- baseColor - the default baseColor of the Hi-C plot is red #f00, you can
  change it to blue so then the shading will be done in blue with #00f
- color - this is a color callback that adapts the current Hi-C contact feature
  with the baseColor to generate a shaded block. The default color callback
  function is `function(count, maxScore, baseColor) { return
  baseColor.alpha(Math.min(1,counts/(maxScore/20))).hsl().string() }` where it
  receives the count for a particular block, the maxScore over the region, and
  the baseColor from the baseColor config



## VariantTrack config

- defaultRendering - options: 'pileup' or 'svg'. default 'svg'
- adapter - a variant type adapter config e.g. a VcfTabixAdapter

Example config

```json
{
  "type": "VariantTrack",
  "trackId": "my track",
  "name": "My Variants",
  "assemblyNames": ["hg19"],
  "adapter": {
    "type": "VcfTabixAdapter",
    "vcfGzLocation": { "uri": "http://yourhost/file.vcf.gz" },
    "index": { "location": { "uri": "http://yourhost/file.vcf.gz.tbi" } }
  }
}
```

### VcfTabixAdapter configuration options

- vcfGzLocation - a 'file location' for the BigWig
- index: a subconfigurations chema containing
  - indexType: options TBI or CSI. default TBI
  - location: the location of the index

Example VcfTabixAdapter adapter config

```json
{
  "type": "VcfTabixAdapter",
  "vcfGzLocation": { "uri": "http://yourhost/file.vcf.gz" },
  "index": { "location": { "uri": "http://yourhost/file.vcf.gz.tbi" } }
}
```
## WiggleTrack config

### General WiggleTrack options

- scaleType - options: linear, log, to display the coverage data. default: linear
- adapter - an adapter that returns numeric signal data, e.g. feature.get('score')

### Autoscale options for WiggleTrack

Options for autoscale

- local - min/max values of what is visible on the screen
- global - min/max values in the entire dataset
- localsd - mean value +- N stddevs of what is visible on screen
- globalsd - mean value +/- N stddevs of everything in the dataset

### Score min/max for WiggleTrack

These options overrides the autoscale options and provides a minimum or maximum
value for the autoscale bar

- minScore
- maxScore

### WiggleTrack drawing options

- inverted - draws upside down
- defaultRendering - can be density, xyplot, or line
- summaryScoreMode - options: min, max, whiskers

### Renderer options

- filled - fills in the XYPlot histogram
- bicolorPivot - options: numeric, mean, none. default: numeric
- bicolorPivotValue - number at which the color switches from posColor to
  negColor. default: 0
- color - color or color callback for drawing the values. overrides
  posColor/negColor. default: none
- posColor - color to draw "positive" values. default: red
- negColor - color to draw "negative" values. default: blue
- clipColor - color to draw "clip" indicator. default: red
  Example WiggleTrack config

```json
{
  "trackId": "my_wiggle_track",
  "name": "My Wiggle Track",
  "assemblyNames": ["hg19"],
  "type": "WiggleTrack",
  "adapter": {
    "type": "BigWig",
    "bigWigLocation": { "uri": "http://yourhost/file.bw" }
  }
}
````

### BigWigAdapter options

- bigWigLocation - a 'file location' for the bigwig

Example BigWig adapter config

```json
{
  "type": "BigWig",
  "bigWigLocation": { "uri": "http://yourhost/file.bw" }
}
```

## Disabling analytics

This is done via adding a field in the global configuration in the config file.
For example:

```json
{
  "configuration": {
    "disableAnalytics": true
  }
}
```
