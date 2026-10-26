import styled from 'styled-components';

const StyledWrapper = styled.div`
  border-top: solid 1px ${(props) => props.theme.border.border2};
  background-color: ${(props) => props.theme.background.base};

  .muted {
    color: ${(props) => props.theme.colors.text.muted};
  }

  .timestamp {
    font-family: monospace;
  }
`;

export default StyledWrapper;
