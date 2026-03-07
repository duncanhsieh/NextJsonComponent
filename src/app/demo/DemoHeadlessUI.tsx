'use client';

import React from 'react';
import { Menu, Disclosure, Dialog, DialogBackdrop, Popover, Listbox, Switch, RadioGroup, Combobox } from '@headlessui/react';
import { ClientJsonHydrator } from '@/lib/next-json-component/client';
import type { AnalyzedNode, ActionRegistry } from '@/lib/next-json-component';
import './headless-ui.css'; // Inject CSS

const components = {
  Menu,
  MenuButton: Menu.Button,
  MenuItems: Menu.Items,
  MenuItem: Menu.Item,
  Disclosure,
  DisclosureButton: Disclosure.Button,
  DisclosurePanel: Disclosure.Panel,
  Dialog,
  DialogPanel: Dialog.Panel,
  DialogTitle: Dialog.Title,
  DialogBackdrop,
  Listbox,
  ListboxButton: Listbox.Button,
  ListboxOptions: Listbox.Options,
  ListboxOption: Listbox.Option,
  Switch,
  RadioGroup,
  RadioGroupOption: RadioGroup.Option,
  Popover,
  PopoverButton: Popover.Button,
  PopoverPanel: Popover.Panel,
  Combobox,
  ComboboxInput: Combobox.Input,
  ComboboxOptions: Combobox.Options,
  ComboboxOption: Combobox.Option,
};

const registry: ActionRegistry = {
  setIsOpen: (state, setState, props, value) => {
    setState({ isDialogOpen: Boolean(value) });
  },
  setSwitchValue: (state, setState, props, value) => {
    setState({ switchValue: Boolean(value) });
  },
  setSelectedPerson: (state, setState, props, value) => {
    setState({ selectedPerson: value });
  },
  setPlan: (state, setState, props, value) => {
    setState({ selectedPlan: value });
  },
  setComboboxPerson: (state, setState, props, value) => {
    setState({ comboboxPerson: value });
  },
  // Provide input typed value to the combobox person search if mapped (simulated filtering or manual mapping via standard input event)
  onComboboxInputChange: (state, setState, props, event) => {
     // event comes from React Event onChange
     setState({ comboboxQuery: (event as React.ChangeEvent<HTMLInputElement>).target.value });
  }
};

export function DemoHeadlessUI({ template }: { template: AnalyzedNode }) {
  return (
    <ClientJsonHydrator
      template={template}
      options={{
        components: components as any,
        actionRegistry: registry,
        initialState: {
          isDialogOpen: false,
          switchValue: false,
          selectedPerson: 'Durward Reynolds',
          selectedPlan: 'Startup',
          comboboxPerson: '',
          comboboxQuery: '',
        }
      }}
    />
  );
}
