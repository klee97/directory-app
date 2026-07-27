import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationResult } from '@/types/location';
import LocationAutocomplete from './LocationAutocomplete';

const mockSelectedLocation: LocationResult = {
  display_name: 'New York, NY',
  type: 'city',
  lat: 40.7128,
  lon: -74.006,
};

function setup(overrides: Partial<Parameters<typeof LocationAutocomplete>[0]> = {}) {
  const onInputChange = vi.fn();
  const onDebouncedChange = vi.fn();
  const onSelect = vi.fn();

  const props = {
    inputValue: mockSelectedLocation.display_name,
    onInputChange,
    onDebouncedChange,
    selectedLocation: mockSelectedLocation,
    onSelect,
    results: [],
    loading: false,
    placeholder: 'Search for a location...',
    ...overrides,
  };

  render(<LocationAutocomplete {...props} />);
  const input = screen.getByPlaceholderText(props.placeholder);

  return { input, onInputChange, onDebouncedChange, onSelect };
}

describe('LocationAutocomplete - deletion behavior', () => {
  it('does NOT clear the filter on partial deletion', async () => {
    const { input, onSelect } = setup();
    const user = userEvent.setup();

    // Simulate backspacing one character: "New York, NY" -> "New York, N"
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does NOT clear the filter on multiple partial deletions', async () => {
    const { input, onSelect } = setup();
    const user = userEvent.setup();

    await user.click(input);
    await user.keyboard('{Backspace}{Backspace}{Backspace}');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('clears the filter (calls onSelect(null)) when text is fully deleted', async () => {
    const { input, onSelect } = setup({ inputValue: 'N' });
    const user = userEvent.setup();

    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('clears the filter when the X (clear) button is clicked, regardless of remaining text', async () => {
    const { onSelect } = setup();
    const user = userEvent.setup();

    const clearButton = screen.getByLabelText('clear input');
    await user.click(clearButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('still forwards every keystroke to onInputChange during partial deletion', async () => {
    const { input, onInputChange } = setup();
    const user = userEvent.setup();

    await user.click(input);
    await user.keyboard('{Backspace}');

    // onInputChange should fire even though onSelect does not,
    // so the visible text still updates.
    expect(onInputChange).toHaveBeenCalled();
    expect(onInputChange).toHaveBeenCalledWith('New York, N');
  });

  it('calls onSelect with a new location when a suggestion is picked after partial deletion', async () => {
    const newResult: LocationResult = {
      display_name: 'Boston, MA',
      type: 'city',
      lat: 42.3601,
      lon: -71.0589,
    };

    const { input, onSelect } = setup({ results: [newResult] });
    const user = userEvent.setup();

    // Typing (partial deletion or otherwise) is what opens the dropdown
    await user.click(input);
    await user.keyboard('{Backspace}');

    const option = await screen.findByText('Boston, MA');
    await user.click(option);

    expect(onSelect).toHaveBeenCalledWith(newResult);
  });
});