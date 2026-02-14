import XCTest
import SwiftTreeSitter
import TreeSitterPrism

final class TreeSitterPrismTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_prism())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading prism grammar")
    }
}
