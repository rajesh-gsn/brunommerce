import React, { useMemo } from 'react';
import { IconClock } from '@tabler/icons';
import { usePersistedState } from 'hooks/usePersistedState';
import Select from 'ui/Select';
import { formatInZone, formatRelative, getTimeZones, modernZoneName, parseTimestamp } from 'utils/response/timestamps';
import StyledWrapper from './StyledWrapper';

const SYSTEM_ZONE = 'system';

const TimeZoneBar = ({ selectedText, dateHeader }) => {
  // One zone for every response: once chosen it stays chosen
  const [zone, setZone] = usePersistedState({ key: 'response-time-zone', default: SYSTEM_ZONE });
  const timeZone = zone === SYSTEM_ZONE ? undefined : zone;

  const zoneOptions = useMemo(() => {
    const systemZone = modernZoneName(new Intl.DateTimeFormat().resolvedOptions().timeZone);
    return [
      { value: SYSTEM_ZONE, label: `System (${systemZone})` },
      ...getTimeZones().map((name) => ({ value: name, label: name }))
    ];
  }, []);

  const selected = parseTimestamp(selectedText);
  const responseDate = dateHeader ? new Date(dateHeader) : null;
  const hasResponseDate = responseDate && !Number.isNaN(responseDate.getTime());

  return (
    <StyledWrapper className="flex flex-col gap-1 px-1 py-1.5 text-xs" data-testid="time-zone-bar">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 shrink-0">
          <IconClock size={14} strokeWidth={2} className="muted" />
          <div className="w-56">
            <Select
              data={zoneOptions}
              value={zone}
              onChange={setZone}
              allowDeselect={false}
              searchable
              size="sm"
              data-testid="time-zone-select"
            />
          </div>
        </div>

        {hasResponseDate ? (
          <div className="muted text-right shrink-0 whitespace-nowrap" data-testid="time-zone-response-date">
            Response date: {formatInZone(responseDate, timeZone)}
          </div>
        ) : null}
      </div>

      <div className="min-h-[1.25rem] break-words" data-testid="time-zone-selected">
        {selected ? (
          <>
            <span className="timestamp muted">{selected.text}</span>
            <span className="muted"> → </span>
            <strong>{formatInZone(selected.date, timeZone)}</strong>
            <span className="muted"> · {formatRelative(selected.date)}</span>
          </>
        ) : (
          <span className="muted">Select a timestamp in the response to see it in this time zone</span>
        )}
      </div>
    </StyledWrapper>
  );
};

export default TimeZoneBar;
