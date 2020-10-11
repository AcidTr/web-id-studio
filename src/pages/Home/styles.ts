import styled from 'styled-components';

export const Container = styled.div``;

export const Header = styled.header`
  padding: 32px 0;
  background: #28262e;
`;

export const HeaderContent = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;

  > img {
    height: 80px;
  }

  button {
    margin-left: auto;
    background: transparent;
    border: 0;

    svg {
      color: #999591;
      width: 20px;
      height: 20px;
    }
  }
`;

export const Profile = styled.div`
  display: flex;
  align-items: center;
  margin-left: 80px;

  img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
  }

  div {
    display: flex;
    flex-direction: column;
    margin-left: 16px;
    line-height: 24px;

    span {
      color: #f4ede8;
    }

    strong {
      color: #ff9000;
    }

    a {
      text-decoration: none;
      color: #ff9000;

      &:hover {
        opacity: 0.8;
      }
    }
  }
`;

export const Content = styled.main`
  max-width: 1120px;
  margin: 64px auto;
  display: flex;
`;

export const Schedule = styled.div`
  flex: 1;
  margin-right: 120px;

  h1 {
    font-size: 36px;
  }

  p {
    margin-top: 8px;
    color: #ff9000;
    display: flex;
    align-items: center;
    font-weight: 500;

    span {
      display: flex;
      align-items: center;
    }

    span + span::before {
      content: '';
      width: 1px;
      height: 12px;
      background: #ff9900;
      margin: 0 8px;
    }
  }
`;

export const BarberProvider = styled.div`
  margin-top: 20px;

  a {
    flex: 1;
    border: 0;
    text-decoration: none;

    div {
      background: #3e3b47;
      display: flex;
      align-items: center;
      padding: 16px 24px;
      border-radius: 10px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        height: 80%;
        width: 1px;
        left: 0;
        top: 10%;
        color: #ff9000;
      }

      img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
      }

      div {
        width: 280px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        margin: -2px 0 0;

        strong {
          color: #fff;
        }
      }
    }
  }
`;
