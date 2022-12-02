type keyOf<T> = keyof T;
type keysOf<T> = keyOf<T>[];
type valueOf<T> = T[keyOf<T>];
type valuesOf<T> = valueOf<T>[];

export interface Match<Record, Source extends Partial<Record>> {
    keys: keysOf<Source>,
    source: Source,
};

export interface MatchResult<Record, Sources extends Partial<Record>[]> {
    matches: Match<Record, Sources[number]>[],
    target: Record,
};

export class RecordParser<Record> {

    #keys: keysOf<Record>;

    constructor(keys: keysOf<Record>) {
        this.#keys = keys.slice();
    }

    static match<Record, Sources extends Partial<Record>[]>(
        target: Record,
        sources: Sources,
        compare: (targetValue: valueOf<Record>, sourceValue: valueOf<Record>) => boolean
    ): MatchResult<Record, Sources> {
        return {
            matches: sources
                .map((source: Partial<Record>): Match<Record, Sources[number]> => ({
                    keys: Object.keys(source)
                        .map((key: string): keyof Record => key as keyof Record)
                        .filter((key: keyof Record): boolean => compare(target[key], source[key]!)),
                    source,
                }))
                .filter((match: Match<Record, Sources[number]>): boolean => match.keys.length > 0),
            target,
        };
    }

    toLines(records: Record[]): valuesOf<Record>[] {
        return records.map((record: Record): valuesOf<Record> =>
            this.#keys.map((key: keyof Record): valueOf<Record> =>
                record[key]));
    }

    toRecords(lines: valuesOf<Record>[]): Record[] {
        return lines.map((line: valuesOf<Record>): Record =>
            this.#keys.reduce((record: Partial<Record>, key: keyof Record, column: number): Partial<Record> =>
                Object.assign(record, { [key]: line[column] }), {}) as Record);
    }

};