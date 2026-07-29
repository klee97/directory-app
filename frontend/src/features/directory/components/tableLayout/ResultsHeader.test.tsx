import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultsHeader } from './ResultsHeader';
import { useURLFiltersContext } from '@/contexts/URLFiltersContext';
import { SORT_OPTIONS } from '@/types/sort';
import { SKILL_PARAM, SERVICE_PARAM } from '@/lib/constants';

vi.mock('@/contexts/URLFiltersContext', () => ({
  useURLFiltersContext: vi.fn(),
}));

describe('ResultsHeader — filter chip removal', () => {
  const setParamsMock = vi.fn();
  const setArrayParamMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockContext(params: Record<string, string[]>) {
    (useURLFiltersContext as ReturnType<typeof vi.fn>).mockReturnValue({
      getAllParams: (key: string) => params[key] ?? [],
      setParams: setParamsMock,
      setArrayParam: setArrayParamMock,
    });
  }

  function renderHeader() {
    return render(
      <ResultsHeader
        loading={false}
        resultCount={3}
        selectedLocation={null}
        sortOption={Object.values(SORT_OPTIONS)[0]}
        onSortChange={vi.fn()}
      />
    );
  }

  it('removes one of multiple selected skills via setArrayParam, not a comma-joined setParams call', async () => {
    mockContext({ [SKILL_PARAM]: ['Thai Makeup', 'South Asian Makeup'] });
    renderHeader();

    const chip = screen.getByTestId('filter-chip-skill-Thai Makeup');
    const deleteIcon = within(chip).getByTestId('CancelIcon');
    await userEvent.click(deleteIcon);

    // Must call setArrayParam with the remaining values as an array —
    // guards against reverting to setParams({ skill: 'South Asian Makeup' })
    // or a comma-joined string, which corrupts repeated-param semantics.
    expect(setArrayParamMock).toHaveBeenCalledWith(SKILL_PARAM, ['South Asian Makeup']);
    expect(setParamsMock).not.toHaveBeenCalled();
  });

  it('removes the last remaining value by passing null, not an empty array or empty string', async () => {
    mockContext({ [SERVICE_PARAM]: ['Hair'] });
    renderHeader();

    const chip = screen.getByTestId('filter-chip-service-Hair');
    const deleteIcon = within(chip).getByTestId('CancelIcon');
    await userEvent.click(deleteIcon);

    expect(setArrayParamMock).toHaveBeenCalledWith(SERVICE_PARAM, null);
  }); 

  it('never passes a comma-joined string for any filter type', async () => {
    mockContext({ [SKILL_PARAM]: ['Thai Makeup', 'South Asian Makeup', 'Bridal'] });
    renderHeader();

    const chip = screen.getByTestId('filter-chip-skill-South Asian Makeup');
    const deleteIcon = within(chip).getByTestId('CancelIcon');
    await userEvent.click(deleteIcon);

    const [, valuesArg] = setArrayParamMock.mock.calls[0];
    expect(Array.isArray(valuesArg)).toBe(true);
    expect(valuesArg).not.toEqual(expect.stringContaining(','));
  });
});