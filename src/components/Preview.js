import React, { useContext } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import editorContext from "../editorContext";

const Container = styled.div`
  width: 30%;
  padding: 13px;
  font-family: "Lato", sans-serif;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 1em;
  padding: 8px 0;
  border-bottom: 1px solid rgba(15, 15, 15, 0.3);
`;

const ResultArea = styled.div`
  width: 500px;
  white-space: normal;
  overflow-x: auto;
  border: none;
  font-size: 17px;
`;

export function Preview(props) {
  const { markdownText } = useContext(editorContext);

  return (
    <Container>
      <Title>Converted Text</Title>
      <ResultArea>
        <ReactMarkdown source={markdownText} />
      </ResultArea>
    </Container>
  );
}
