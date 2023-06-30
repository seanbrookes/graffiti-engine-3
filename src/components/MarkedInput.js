import React, { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { useEditorContext } from "../editorContext";

const Container = styled.div`
  padding: 12px 0 0 0;
  border: 0;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 1em;
  padding: 8px 0;
  border-bottom: 1px solid rgba(15, 15, 15, 0.3);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 140px;
  border: 1px solid #dddddd;
  padding: 13px;
  font-size: 17px;
`;

export function MarkedInput(props) {
  const { currentPost, setCurrentPost } = useEditorContext();
  const [ markdownText, setMarkdownText ] = useState('');

  useEffect(() => {
    if (currentPost) {
      const newCopy = {...currentPost};
      setMarkdownText(newCopy.body);
    }

  }, []);

  const onInputChange = e => {
    const newValue = e.currentTarget.value;
    setMarkdownText(newValue);
    currentPost.body = newValue;
    setCurrentPost(currentPost);
  };

  return (
    <Container>
      <TextArea onChange={onInputChange} value={markdownText} />
    </Container>
  );
}
