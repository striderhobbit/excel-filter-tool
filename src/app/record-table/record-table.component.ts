import { Component } from '@angular/core';
import { MatchResult, RecordParser } from '../record-parser';
import shazamLines from "../shazam-lines.json";
import playlistLines from "../playlist-lines.json";

interface Record {
    Artist: string,
    Index: string,
    Status: string,
    TagTime: string,
    Title: string,
    TrackKey: string,
    URL: string,
};

type MatchSource = Pick<Record, "Title" | "Artist"> & Partial<Record>;

@Component({
    selector: 'app-record-table',
    templateUrl: './record-table.component.html',
    styleUrls: ['./record-table.component.css']
})
export class RecordTableComponent {

    keys: Array<keyof Record> = ["Index", "Status", "TagTime", "Title", "Artist", "URL", "TrackKey"];

    private recordParser = new RecordParser<Record>(this.keys);

    records: Record[] = this.recordParser.toRecords(shazamLines);

    matchResults: MatchResult<Record, MatchSource[]>[] = this.records.map((matchTarget: Record) =>
        RecordParser.match<Record, MatchSource[]>(
            matchTarget,
            new RecordParser<MatchSource>(["Title", "Artist"]).toRecords(playlistLines),
            (targetValue, sourceValue) => {
                const words = sourceValue.replace(/(?:(?:-\s+|\().*)$/, "").match(/\w+/g);

                return words
                    ? new RegExp(`\\b${words.join("\\s+")}\\b`, "i").test(targetValue)
                    : false
            }))
        .filter(match => match.matches.length > 0);

    get lines(): Record[keyof Record][][] {
        return this.recordParser.toLines(this.records);
    }

    copyLines(): void {
        navigator.clipboard.writeText(this.lines.map(line => line.join("\t")).join("\n"));
    }

};