/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChannelEntry {
  id: string; // Unique client-side ID (e.g., uuid or simple random string)
  sequence: number; // Order sequence
  tvgId: string;
  tvgName: string;
  tvgLogo: string;
  groupTitle: string;
  name: string; // Channel name from after the last comma
  url: string; // Stream link
  rawExtInf?: string; // Cache the raw extinf attributes that are not standard if needed
}

export interface M3UPlaylist {
  fileName: string;
  headerAttributes: string; // e.g. x-tvg-url="http://..."
  channels: ChannelEntry[];
  hasUnsavedChanges: boolean;
}
