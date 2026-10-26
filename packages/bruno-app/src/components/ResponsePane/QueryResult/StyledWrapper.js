import styled from 'styled-components';
import { rgba } from 'polished';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;

  /* This is a hack to force Codemirror to use all available space */
  > div {
    position: relative;
  }

  div.CodeMirror {
    position: absolute;
    top: 0;
    bottom: 0;
    height: 100%;
    width: 100%;
  }

  div[role='tablist'] {
    .active {
      color: ${(props) => props.theme.colors.text.yellow};
    }
  }

  /* Local-time chip shown after a timestamp in the response editor */
  .timestamp-chip {
    margin-left: 0.5rem;
    padding: 0 0.5rem;
    border-radius: 999px;
    border: 1px solid ${(props) => rgba(props.theme.primary.solid, 0.3)};
    background-color: ${(props) => rgba(props.theme.primary.solid, 0.12)};
    color: ${(props) => props.theme.primary.text};
    font-family: inherit;
    font-size: 0.75em;
    white-space: nowrap;
    user-select: none;
    vertical-align: middle;
  }

  .muted {
    color: ${(props) => props.theme.colors.text.muted};
  }

  .error {
    color: ${(props) => props.theme.colors.text.danger};
  }

  .response-filter {
    position: absolute;
    bottom: 0;
    width: 100%;

    input {
      border: solid 1px ${(props) => props.theme.border.border2};
      border-radius: ${(props) => props.theme.border.radius.sm};
      background-color: ${(props) => props.theme.background.base};

      &:focus {
        outline: none;
      }
    }
  }
`;

export default StyledWrapper;
