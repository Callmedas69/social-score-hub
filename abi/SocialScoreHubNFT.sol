// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SocialScoreHubNFT is
    ERC721,
    ERC2981,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    using Strings for uint256;

    uint256 public constant MINT_PRICE = 0.00005 ether;
    uint256 public constant MINT_COOLDOWN = 12 hours;

    uint256 private _nextTokenId;
    address public treasury;
    mapping(address => uint256) public lastMintTimestamp;
    mapping(uint256 => bytes32) public tokenColorSeed;

    error InsufficientPayment();
    error MintCooldownActive(uint256 timeRemaining);
    error WithdrawFailed();
    error InvalidAddress();
    error RefundFailed();

    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury
    );
    event Minted(
        address indexed to,
        uint256 indexed tokenId,
        bytes32 colorSeed
    );

    constructor(
        address initialOwner,
        address initialTreasury
    ) ERC721("Social Score Hub NFT", "SSH") Ownable(initialOwner) {
        if (initialTreasury == address(0)) revert InvalidAddress();
        treasury = initialTreasury;
        _setDefaultRoyalty(initialTreasury, 100); // 1% royalty (100 basis points)
    }

    function mint() external payable whenNotPaused nonReentrant {
        if (msg.value < MINT_PRICE) revert InsufficientPayment();

        uint256 lastMint = lastMintTimestamp[msg.sender];
        if (lastMint != 0 && block.timestamp < lastMint + MINT_COOLDOWN) {
            revert MintCooldownActive(
                lastMint + MINT_COOLDOWN - block.timestamp
            );
        }

        uint256 tokenId = _nextTokenId++;
        bytes32 seed = keccak256(
            abi.encodePacked(msg.sender, tokenId, block.prevrandao)
        );

        lastMintTimestamp[msg.sender] = block.timestamp;
        tokenColorSeed[tokenId] = seed;

        _safeMint(msg.sender, tokenId);

        emit Minted(msg.sender, tokenId, seed);

        if (msg.value > MINT_PRICE) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - MINT_PRICE}("");
            if (!refundSuccess) revert RefundFailed();
        }
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);

        bytes32 seed = tokenColorSeed[tokenId];
        string[6] memory colors = _getColors(seed);
        string[6] memory darkColors = _getDarkColors(seed);

        string memory svg = _generateSVG(colors, darkColors);
        string memory attributes = _generateAttributes(colors);

        string memory json = string(
            abi.encodePacked(
                '{"name":"SSH NFT #',
                tokenId.toString(),
                '","description":"Social Score Hub DAO Token","image_data":"',
                svg,
                '","attributes":',
                attributes,
                "}"
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    function _getColors(
        bytes32 seed
    ) internal pure returns (string[6] memory colors) {
        for (uint256 i = 0; i < 6; i++) {
            bytes3 colorBytes = bytes3(seed << (i * 24));
            colors[i] = _toHexColor(colorBytes);
        }
    }

    function _getDarkColors(
        bytes32 seed
    ) internal pure returns (string[6] memory darkColors) {
        for (uint256 i = 0; i < 6; i++) {
            bytes3 colorBytes = bytes3(seed << (i * 24));
            darkColors[i] = _toHexColor(_darkenColor(colorBytes));
        }
    }

    function _darkenColor(bytes3 color) internal pure returns (bytes3) {
        uint8 r = uint8((uint256(uint8(color[0])) * 70) / 100);
        uint8 g = uint8((uint256(uint8(color[1])) * 70) / 100);
        uint8 b = uint8((uint256(uint8(color[2])) * 70) / 100);
        return bytes3(bytes.concat(bytes1(r), bytes1(g), bytes1(b)));
    }

    function _toHexColor(bytes3 color) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789ABCDEF";
        bytes memory result = new bytes(7);
        result[0] = "#";
        for (uint256 i = 0; i < 3; i++) {
            result[1 + i * 2] = hexChars[uint8(color[i]) >> 4];
            result[2 + i * 2] = hexChars[uint8(color[i]) & 0x0f];
        }
        return string(result);
    }

    function _generateSVG(
        string[6] memory colors,
        string[6] memory darkColors
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    _svgHeader(),
                    _svgDefs(colors, darkColors),
                    _svgOrbs(),
                    "</svg>"
                )
            );
    }

    function _svgHeader() internal pure returns (string memory) {
        return
            '<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">';
    }

    function _svgDefs(
        string[6] memory colors,
        string[6] memory darkColors
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "<defs>",
                    '<filter id="g" x="-150%" y="-150%" width="400%" height="400%">',
                    '<feGaussianBlur in="SourceGraphic" stdDeviation="25" result="b1"/>',
                    '<feGaussianBlur in="SourceGraphic" stdDeviation="15" result="b2"/>',
                    '<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b3"/>',
                    '<feMerge><feMergeNode in="b1"/><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="b3"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
                    '<filter id="c" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur in="SourceGraphic" stdDeviation="20"/></filter>',
                    _svgGradients(colors, darkColors),
                    "</defs>",
                    '<rect width="512" height="512" fill="#000"/>'
                )
            );
    }

    function _svgGradients(
        string[6] memory colors,
        string[6] memory darkColors
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    _gradient("o0", colors[0], darkColors[0]),
                    _gradient("o1", colors[1], darkColors[1]),
                    _gradient("o2", colors[2], darkColors[2]),
                    _gradient("o3", colors[3], darkColors[3]),
                    _gradient("o4", colors[4], darkColors[4]),
                    _gradient("o5", colors[5], darkColors[5])
                )
            );
    }

    function _gradient(
        string memory id,
        string memory light,
        string memory dark
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<radialGradient id="',
                    id,
                    '" cx="50%" cy="50%" r="50%">',
                    '<stop offset="0%" stop-color="',
                    light,
                    '"/>',
                    '<stop offset="100%" stop-color="',
                    dark,
                    '"/>',
                    "</radialGradient>"
                )
            );
    }

    function _svgOrbs() internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    _orb("256", "120", "o0"),
                    _orb("360", "200", "o1"),
                    _orb("360", "320", "o2"),
                    _orb("256", "392", "o3"),
                    _orb("152", "320", "o4"),
                    _orb("152", "200", "o5")
                )
            );
    }

    function _orb(
        string memory cx,
        string memory cy,
        string memory gradientId
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<circle cx="',
                    cx,
                    '" cy="',
                    cy,
                    '" r="40" fill="url(#',
                    gradientId,
                    ')" filter="url(#g)"/>',
                    '<circle cx="',
                    cx,
                    '" cy="',
                    cy,
                    '" r="20" fill="#FFF" filter="url(#c)"/>'
                )
            );
    }

    function _generateAttributes(
        string[6] memory colors
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '[{"trait_type":"Top","value":"',
                    colors[0],
                    '"},{"trait_type":"Upper Right","value":"',
                    colors[1],
                    '"},{"trait_type":"Lower Right","value":"',
                    colors[2],
                    '"},{"trait_type":"Bottom","value":"',
                    colors[3],
                    '"},{"trait_type":"Lower Left","value":"',
                    colors[4],
                    '"},{"trait_type":"Upper Left","value":"',
                    colors[5],
                    '"}]'
                )
            );
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        (bool success, ) = treasury.call{value: address(this).balance}("");
        if (!success) revert WithdrawFailed();
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function contractURI() public pure returns (string memory) {
        string memory svg = _collectionImage();
        string memory json = string(
            abi.encodePacked(
                '{"name":"Social Score Hub","description":"Social Score Hub DAO Token","image_data":"',
                svg,
                '"}'
            )
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    function _collectionImage() internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs>',
                    '<filter id="g" x="-150%" y="-150%" width="400%" height="400%">',
                    '<feGaussianBlur in="SourceGraphic" stdDeviation="25" result="b1"/>',
                    '<feGaussianBlur in="SourceGraphic" stdDeviation="15" result="b2"/>',
                    '<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b3"/>',
                    '<feMerge><feMergeNode in="b1"/><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="b3"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
                    '<filter id="c" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur in="SourceGraphic" stdDeviation="20"/></filter>',
                    _collectionGradients(),
                    '</defs><rect width="512" height="512" fill="#000"/>',
                    _collectionOrbs()
                )
            );
    }

    function _collectionGradients() internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<radialGradient id="o0" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#E5EC72"/><stop offset="100%" stop-color="#A8B430"/></radialGradient>',
                    '<radialGradient id="o1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#5A9AAA"/><stop offset="100%" stop-color="#1E3742"/></radialGradient>',
                    '<radialGradient id="o2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#D2F6FB"/><stop offset="100%" stop-color="#70D8EA"/></radialGradient>',
                    '<radialGradient id="o3" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#8A3065"/><stop offset="100%" stop-color="#35002A"/></radialGradient>',
                    '<radialGradient id="o4" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FF4A5A"/><stop offset="100%" stop-color="#B00820"/></radialGradient>',
                    '<radialGradient id="o5" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#D4AA8A"/><stop offset="100%" stop-color="#896252"/></radialGradient>'
                )
            );
    }

    function _collectionOrbs() internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<circle cx="256" cy="120" r="40" fill="url(#o0)" filter="url(#g)"/><circle cx="256" cy="120" r="20" fill="#FFF" filter="url(#c)"/>',
                    '<circle cx="360" cy="200" r="40" fill="url(#o1)" filter="url(#g)"/><circle cx="360" cy="200" r="20" fill="#FFF" filter="url(#c)"/>',
                    '<circle cx="360" cy="320" r="40" fill="url(#o2)" filter="url(#g)"/><circle cx="360" cy="320" r="20" fill="#FFF" filter="url(#c)"/>',
                    '<circle cx="256" cy="392" r="40" fill="url(#o3)" filter="url(#g)"/><circle cx="256" cy="392" r="20" fill="#FFF" filter="url(#c)"/>',
                    '<circle cx="152" cy="320" r="40" fill="url(#o4)" filter="url(#g)"/><circle cx="152" cy="320" r="20" fill="#FFF" filter="url(#c)"/>',
                    '<circle cx="152" cy="200" r="40" fill="url(#o5)" filter="url(#g)"/><circle cx="152" cy="200" r="20" fill="#FFF" filter="url(#c)"/></svg>'
                )
            );
    }
}
