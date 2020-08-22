import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'ramda';
import createServerConstruct from '../../src/servers/CreateServer';
import { ServerForm } from '../../src/servers/helpers/ServerForm';

describe('<CreateServer />', () => {
  let wrapper;
  const ImportServersBtn = () => '';
  const createServerMock = jest.fn();
  const historyMock = {
    push: jest.fn(),
  };
  const createWrapper = (serversImported = false) => {
    const CreateServer = createServerConstruct(ImportServersBtn, () => [ serversImported, () => '' ]);

    wrapper = shallow(
      <CreateServer createServer={createServerMock} resetSelectedServer={identity} history={historyMock} />,
    );

    return wrapper;
  };

  afterEach(() => {
    jest.resetAllMocks();
    wrapper && wrapper.unmount();
  });

  it('renders components', () => {
    const wrapper = createWrapper();

    expect(wrapper.find(ServerForm)).toHaveLength(1);
    expect(wrapper.find('.create-server__import-success-msg')).toHaveLength(0);
  });

  it('shows success message when imported is true', () => {
    const wrapper = createWrapper(true);

    expect(wrapper.find('.create-server__import-success-msg')).toHaveLength(1);
  });

  it('creates server and redirects to it when form is submitted', () => {
    const wrapper = createWrapper();
    const form = wrapper.find(ServerForm);

    form.simulate('submit', {});

    expect(createServerMock).toHaveBeenCalledTimes(1);
    expect(historyMock.push).toHaveBeenCalledTimes(1);
  });
});
