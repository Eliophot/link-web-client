import { shallow, ShallowWrapper } from 'enzyme';
import { PaginationItem } from 'reactstrap';
import Paginator from '../../src/short-urls/Paginator';

describe('<Paginator />', () => {
  let wrapper: ShallowWrapper;

  afterEach(() => wrapper?.unmount());

  it('renders nothing if the number of pages is below 2', () => {
    wrapper = shallow(<Paginator serverId="abc123" />);
    expect(wrapper.text()).toEqual('');
  });

  it('renders previous, next and the list of pages', () => {
    const paginator = {
      currentPage: 1,
      pagesCount: 5,
      totalItems: 10,
    };
    const extraPagesPrevNext = 2;
    const expectedItems = paginator.pagesCount + extraPagesPrevNext;

    wrapper = shallow(<Paginator serverId="abc123" paginator={paginator} />);

    expect(wrapper.find(PaginationItem)).toHaveLength(expectedItems);
  });
});
