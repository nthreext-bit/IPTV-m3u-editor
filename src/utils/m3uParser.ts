/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelEntry, M3UPlaylist } from "../types";

// Helper to generate a simple unique ID for client-side lists
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// Extract attributes safely from #EXTINF line
export function extractAttribute(extinfLine: string, attrName: string): string {
  // Quoted string match (double quotes): tvg-id="TRT 1"
  const doubleQuoteRegex = new RegExp(`${attrName}\\s*=\\s*"([^"]*)"`, "i");
  let match = extinfLine.match(doubleQuoteRegex);
  if (match) return match[1].trim();

  // Quoted string match (single quotes): tvg-id='TRT 1'
  const singleQuoteRegex = new RegExp(`${attrName}\\s*=\\s*'([^']*)'`, "i");
  match = extinfLine.match(singleQuoteRegex);
  if (match) return match[1].trim();

  // Unquoted string match (stops at space or comma or end): tvg-id=TRT1
  const unquotedRegex = new RegExp(`${attrName}\\s*=\\s*([^\\s,]+)`, "i");
  match = extinfLine.match(unquotedRegex);
  if (match) return match[1].trim();

  return "";
}

/**
 * Parses an M3U content string into a structured M3UPlaylist object.
 * Designed to be highly efficient and asynchronous-friendly if needed.
 */
export function parseM3U(content: string, fileName: string): M3UPlaylist {
  const lines = content.split(/\r?\n/);
  let headerAttributes = "";
  const channels: ChannelEntry[] = [];
  
  if (lines.length === 0) {
    return { fileName, headerAttributes, channels, hasUnsavedChanges: false };
  }

  // Parse first line (header)
  const firstLine = lines[0].trim();
  if (firstLine.toUpperCase().startsWith("#EXTM3U")) {
    // Extract everything after #EXTM3U as header attributes (e.g., url-tvg or x-tvg-url)
    headerAttributes = firstLine.substring(7).trim();
  }

  let i = firstLine.toUpperCase().startsWith("#EXTM3U") ? 1 : 0;
  let sequence = 1;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Look for EXTINF line
    if (line.toUpperCase().startsWith("#EXTINF:")) {
      const extinfLine = line;
      
      // Parse attributes
      const tvgId = extractAttribute(extinfLine, "tvg-id");
      const tvgName = extractAttribute(extinfLine, "tvg-name");
      const tvgLogo = extractAttribute(extinfLine, "tvg-logo");
      const groupTitle = extractAttribute(extinfLine, "group-title") || extractAttribute(extinfLine, "group");
      
      // Parse channel name (after the last comma in the #EXTINF line)
      const commaIndex = extinfLine.lastIndexOf(",");
      let channelName = "Bilinmeyen Kanal";
      if (commaIndex !== -1) {
        channelName = extinfLine.substring(commaIndex + 1).trim();
      } else {
        // Fallback: search for last space or word
        channelName = extinfLine.substring(extinfLine.indexOf(":") + 1).trim();
      }

      // Find the next non-empty, non-comment line for the URL
      i++;
      let url = "";
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (nextLine && !nextLine.startsWith("#")) {
          url = nextLine;
          break;
        }
        // Save intermediate comments/options or skip
        i++;
      }

      // Add to list if we have a valid channel structure (or even a blank url is allowed in editor)
      channels.push({
        id: generateId(),
        sequence: sequence++,
        tvgId,
        tvgName,
        tvgLogo,
        groupTitle,
        name: channelName,
        url,
        rawExtInf: extinfLine
      });
    } else {
      // Just progress to next line
      i++;
    }
  }

  return {
    fileName,
    headerAttributes,
    channels,
    hasUnsavedChanges: false
  };
}

/**
 * Serializes an M3UPlaylist back into string format.
 */
export function serializeM3U(playlist: M3UPlaylist): string {
  let output = "#EXTM3U";
  if (playlist.headerAttributes) {
    output += " " + playlist.headerAttributes;
  }
  output += "\n";

  playlist.channels.forEach((channel) => {
    // Reconstruct #EXTINF line
    // Keep duration (usually -1 for live streams, or parse from original if available, default to -1)
    let duration = "-1";
    if (channel.rawExtInf) {
      const durationMatch = channel.rawExtInf.match(/#EXTINF:\s*(-?\d+)/);
      if (durationMatch) {
        duration = durationMatch[1];
      }
    }

    let extinfParts = `#EXTINF:${duration}`;
    
    if (channel.tvgId) extinfParts += ` tvg-id="${channel.tvgId}"`;
    if (channel.tvgName) extinfParts += ` tvg-name="${channel.tvgName}"`;
    if (channel.tvgLogo) extinfParts += ` tvg-logo="${channel.tvgLogo}"`;
    if (channel.groupTitle) extinfParts += ` group-title="${channel.groupTitle}"`;
    
    // Append comma and channel name
    extinfParts += `,${channel.name}`;
    
    output += extinfParts + "\n";
    output += (channel.url || "") + "\n";
  });

  return output;
}
