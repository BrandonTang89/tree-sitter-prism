# tree-sitter-prism

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/index.html) grammar for the [PRISM](https://www.prismmodelchecker.org/) probabilistic model checker that provides syntax highlighting.

Currently only tested/developed for concurrent stochastic games (CSGs), but should be easily extendable to other PRISM model types.

### Todo
- Other query types
- Properties
- Other model types

## Build and Test
Note that tests are only currently written for expressions and not entire CSGs.

```bash
tree-sitter generate
tree-sitter test
```

## Standalone Highlighting
### Setup
First ensure that the grammar is built.

Then ensure this repository is contained within one of the directories of the `parser-directories` field of `~/.config/tree-sitter/config.json`.

### Highlighting
```bash
tree-sitter highlight example.prism
```

## Helix Editor Integration
Add the following to `~/.config/helix/languages.toml`:
```toml
[[language]]
name = "prism"
grammar = "prism"
file-types = ["prism"]
scope = "source.prism"

[[grammar]]
name = "prism"
source = { git = "https://github.com/BrandonTang89/tree-sitter-prism", 
           rev = "master" }
```

and then copy the highlights file into `~/.config/helix/runtime/queries/prism`:
```bash
mkdir -p ~/.config/helix/runtime/queries/prism
cd ~/.config/helix/runtime/queries/prism
curl -O https://raw.githubusercontent.com/BrandonTang89/tree-sitter-prism/refs/heads/master/queries/highlights.scm
```

and then fetch and build the grammar:
```bash
hx --grammar fetch
hx --grammar build
```

Now if you open a `.prism` file in Helix, it should be highlighted. 
You can test this on one of the examples such as [csg_mac_example.prism](./test/csg_mac_example.prism).