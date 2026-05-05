import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function htmlToPlainText(input: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');
  return (doc.body.textContent || '').trim();
}

function diffWords(oldStr: string, newStr: string) {
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);
  const matrix = Array(oldWords.length + 1).fill(null).map(() => Array(newWords.length + 1).fill(0));
  
  for (let i = 1; i <= oldWords.length; i++) {
    for (let j = 1; j <= newWords.length; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }
  
  let i = oldWords.length;
  let j = newWords.length;
  const result = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ value: oldWords[i - 1], type: 'equal' });
      i--; j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      result.unshift({ value: newWords[j - 1], type: 'added' });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      result.unshift({ value: oldWords[i - 1], type: 'removed' });
      i--;
    }
  }
  return result;
}

function getPostIdFromUrl() {
  const match = window.location.pathname.match(/\/comments\/([a-zA-Z0-9]+)\//);
  return match ? match[1] : null;
}

const authorAvatarMap = new Map<string, number>();
let nextAvatarId = 0;

function getAvatarIndex(str: string) {
  if (!str) return 0;
  if (!authorAvatarMap.has(str)) {
    authorAvatarMap.set(str, nextAvatarId);
    nextAvatarId = (nextAvatarId + 1) % 8; // Cycles 0 through 7 for diverse colors
  }
  return authorAvatarMap.get(str);
}

function pageContainsVisibleTextPhrase(phrases: string[]) {
  const nodes = document.querySelectorAll('body *');
  for (const node of Array.from(nodes)) {
    const tagName = node.tagName.toLowerCase();
    if (tagName === 'script' || tagName === 'style' || tagName === 'noscript' || tagName === 'template') {
      continue;
    }

    const el = node as HTMLElement;
    if (el.offsetParent === null) {
      continue;
    }

    const text = (el.innerText || '').toLowerCase();
    if (!text) {
      continue;
    }

    if (phrases.some((phrase) => text.includes(phrase))) {
      return true;
    }
  }

  return false;
}

function CommentNode({ node }: { node: any }) {
  const [collapsed, setCollapsed] = useState(false);
  const avatarIndex = getAvatarIndex(node.author);
  const plainBody = node.body_html
    ? htmlToPlainText(node.body_html)
    : (node.body || '');
  // Dynamic reddit avatar based on username hash
  const avatarUrl = `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarIndex}.png`;

  return (
    <div style={{ display: 'flex', flexDirection: 'row', marginTop: '16px' }}>
      {/* Left Gutter */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '8px', minWidth: '32px' }}>
        {collapsed ? (
          <div 
            onClick={() => setCollapsed(false)}
            style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-neutral-background-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-content-strong)', cursor: 'pointer', fontSize: '18px', lineHeight: '1' }}
            title="Expand"
          >
            +
          </div>
        ) : (
          <img src={avatarUrl} style={{ width: '32px', height: '32px', borderRadius: '50%', zIndex: 1 }} alt="avatar" />
        )}
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, width: '100%', marginTop: '4px' }}>
             <div style={{ width: '2px', height: '16px', backgroundColor: 'var(--color-neutral-border-weak)' }} />
             <div 
               onClick={() => setCollapsed(true)} 
               style={{ 
                 cursor: 'pointer', 
                 width: '16px', 
                 height: '16px', 
                 borderRadius: '50%', 
                 border: '1px solid var(--color-neutral-border-weak)', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 backgroundColor: 'var(--color-neutral-background)',
                 color: 'var(--color-neutral-content-strong)',
                 zIndex: 1
               }}
               title="Collapse"
             >
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
             </div>
             <div style={{ 
               flexGrow: 1, 
               width: '2px', 
               backgroundColor: 'var(--color-neutral-border-weak)',
               cursor: 'pointer',
               transition: 'background-color 0.2s',
               marginTop: '-1px'
             }} 
             onClick={() => setCollapsed(true)}
             onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-content-strong)')}
             onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-border-weak)')}
             />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ fontSize: '12px', color: 'var(--color-neutral-content-weak)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <a 
            href={node.author === '[deleted]' ? undefined : `https://reddit.com/user/${node.author}`} 
            style={{ 
              fontWeight: 'bold', 
              color: 'var(--color-neutral-content-strong)', 
              textDecoration: 'none',
              cursor: node.author === '[deleted]' ? 'default' : 'pointer'
            }}
            onMouseEnter={e => { if (node.author !== '[deleted]') e.currentTarget.style.color = '#24a0ed'; }}
            onMouseLeave={e => { if (node.author !== '[deleted]') e.currentTarget.style.color = 'var(--color-neutral-content-strong)'; }}
            target={node.author === '[deleted]' ? undefined : "_blank"}
            rel="noreferrer"
          >
            {node.author}
          </a> 
          <span>•</span>
          <span>{new Date(node.created_utc * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</span>
        </div>

        {!collapsed && (
          <>
            {/* Body */}
            <div style={{ color: 'var(--color-neutral-content-strong)', fontSize: '14px', lineHeight: '1.4', marginBottom: '8px', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
              {plainBody}
            </div>
            
            {/* Children container */}
            <div style={{ marginTop: '0px' }}>
              {node.children && node.children.map((child: any) => (
                <CommentNode key={child.id} node={child} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ArchivedPostBody({ postData }: { postData: any }) {
  if (!postData) return null;
  const plainSelfText = postData.selftext_html
    ? htmlToPlainText(postData.selftext_html)
    : (postData.selftext || '');
  return (
    <div style={{
      margin: '16px 0', padding: '16px', border: '1px solid rgba(255, 69, 0, 0.4)',
      borderRadius: '8px', backgroundColor: 'var(--color-neutral-background-weak)', color: 'var(--color-neutral-content-strong)'
    }}>
      <h2 style={{ color: 'var(--color-neutral-content-strong)', marginTop: 0, fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg style={{ color: '#ff4500' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <span>Deleted post shown by <span style={{ color: '#ff4500' }}>Unhider for Reddit</span></span>
      </h2>
      <h1 style={{ fontSize: '20px', margin: '0 0 8px 0', color: 'var(--color-neutral-content-strong)' }}>{postData.title}</h1>
      <div style={{ fontSize: '12px', color: 'var(--color-neutral-content-weak)', marginBottom: '12px' }}>
         Posted by <a 
           href={postData.author === '[deleted]' ? undefined : `https://reddit.com/user/${postData.author}`}
           style={{ fontWeight: 'bold', color: 'var(--color-neutral-content-strong)', textDecoration: 'none', cursor: postData.author === '[deleted]' ? 'default' : 'pointer' }}
           onMouseEnter={e => { if (postData.author !== '[deleted]') e.currentTarget.style.color = '#24a0ed'; }}
           onMouseLeave={e => { if (postData.author !== '[deleted]') e.currentTarget.style.color = 'var(--color-neutral-content-strong)'; }}
           target={postData.author === '[deleted]' ? undefined : "_blank"}
           rel="noreferrer"
         >{postData.author}</a> • {new Date(postData.created_utc * 1000).toLocaleString()}
      </div>
      {plainSelfText && (
        <div style={{ fontSize: '14px', lineHeight: '1.4', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
          {plainSelfText}
        </div>
      )}
    </div>
  );
}

function ArchivedCommentsView({ postId, commentsData, rootCommentId, inline }: { postId: string, commentsData: any[], rootCommentId?: string, inline?: boolean }) {
  if (commentsData.length === 0) return null;

  // Build tree
  const commentMap = new Map();
  const roots: any[] = [];
  commentsData.forEach(c => {
    commentMap.set('t1_' + c.id, { ...c, children: [] });
  });
  commentsData.forEach(c => {
    const parent = commentMap.get(c.parent_id);
    if (parent) {
      parent.children.push(commentMap.get('t1_' + c.id));
    } else {
      roots.push(commentMap.get('t1_' + c.id));
    }
  });

  let renderRoots = roots;
  let titleText = `${commentsData.length} deleted comments shown by`;
  
  if (rootCommentId) {
    const targetRoot = commentMap.get('t1_' + rootCommentId);
    if (targetRoot) {
      renderRoots = [targetRoot];
      let count = 0;
      const countDescendants = (node: any) => {
        count++;
        node.children.forEach(countDescendants);
      };
      countDescendants(targetRoot);
      titleText = `${count} deleted comment${count !== 1 ? 's' : ''} recovered by`;
    } else {
      return null;
    }
  }

  return (
    <div style={{
      margin: inline ? '8px 0 0 0' : '16px 0', padding: '16px', border: '1px solid rgba(255, 69, 0, 0.4)',
      borderRadius: '8px', backgroundColor: 'var(--color-neutral-background-weak)', color: 'var(--color-neutral-content-strong)'
    }}>
      <h2 style={{ color: 'var(--color-neutral-content-strong)', margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg style={{ color: '#ff4500' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <span>{titleText} <span style={{ color: '#ff4500' }}>Unhider for Reddit</span></span>
      </h2>
      {renderRoots.map(root => <CommentNode key={root.id} node={root} />)}
    </div>
  );
}

function MainInjectorController({ postId }: { postId: string }) {
  const [postData, setPostData] = useState<any>(null);
  const [commentsData, setCommentsData] = useState<any[]>([]);

  useEffect(() => {
    try {
      const localStr = window.localStorage.getItem(`unhide_post_${postId}`);
      if (localStr) setPostData(JSON.parse(localStr));
    } catch(e) {}

    chrome.runtime.sendMessage({ action: 'GET_COMMENTS', postId }, (response: any) => {
      if (response && response.success && response.data) {
        const arr = Array.isArray(response.data) ? response.data : (response.data.data || []);
        setCommentsData(arr);
      }
    });
  }, [postId]);

  useEffect(() => {
    // Render Post Body
    if (postData) {
      let postContainer = document.getElementById('reddit-unhide-post-container');
      if (!postContainer) {
        postContainer = document.createElement('div');
        postContainer.id = 'reddit-unhide-post-container';
        const shredditPost = document.querySelector('shreddit-post');
        const main = document.querySelector('main');
        const target = shredditPost || main;
        if (target && target.firstChild) {
          target.insertBefore(postContainer, target.firstChild);
        }
      }
      const postRoot = createRoot(postContainer);
      postRoot.render(<ArchivedPostBody postData={postData} />);
    }

    // Render Comments
    if (commentsData.length > 0) {
      let commentsContainer = document.getElementById('reddit-unhide-comments-container');
      if (!commentsContainer) {
        commentsContainer = document.createElement('div');
        commentsContainer.id = 'reddit-unhide-comments-container';
        const nativeTree = document.querySelector('shreddit-comment-tree');
        if (nativeTree && nativeTree.parentNode) {
          nativeTree.parentNode.insertBefore(commentsContainer, nativeTree.nextSibling);
        } else {
          // Fallback if no native tree
          const main = document.querySelector('main');
          if (main) main.appendChild(commentsContainer);
        }
      }
      const commentsRoot = createRoot(commentsContainer);
      commentsRoot.render(<ArchivedCommentsView postId={postId} commentsData={commentsData} />);
    }
  }, [postData, commentsData]);

  return null;
}

function GhostThreadController({ postId, commentId }: { postId: string, commentId: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[] | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (data) {
      setRevealed(true);
      return;
    }
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'GET_COMMENTS', postId }, (response: any) => {
      setLoading(false);
      if (response && response.success && response.data) {
        const arr = Array.isArray(response.data) ? response.data : (response.data.data || []);
        const target = arr.find((c: any) => c.id === commentId);
        if (target) {
          setData(arr);
          setRevealed(true);
        } else {
           setData([]);
           setRevealed(true);
        }
      } else {
        setData([]);
        setRevealed(true);
      }
    });
  };

  if (revealed) {
    if (!data || data.length === 0 || !data.find(c => c.id === commentId)) {
      return <div style={{ color: '#ff4500', fontSize: '12px', marginTop: '8px' }}>Not found in archive.</div>;
    }
    return <ArchivedCommentsView postId={postId} commentsData={data} rootCommentId={commentId} inline={true} />;
  }

  return (
    <button 
      onClick={handleReveal}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 12px', borderRadius: '16px', border: '1px solid #ff4500',
        backgroundColor: 'transparent', color: '#ff4500', fontSize: '12px', fontWeight: 'bold',
        cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 69, 0, 0.1)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      {loading ? 'Searching Archive...' : '👀 Reveal Ghost Thread'}
    </button>
  );
}

function injectInlineGhostThreads(postId: string) {
  const comments = document.querySelectorAll('shreddit-comment:not([data-unhider-injected="true"])');
  comments.forEach((commentEl: any) => {
    const author = commentEl.getAttribute('author');
    const content = commentEl.textContent || '';
    
    if (author === '[deleted]' || content.includes('[deleted]') || content.includes('comment deleted by user')) {
      commentEl.setAttribute('data-unhider-injected', 'true');
      
      const thingId = commentEl.getAttribute('thingid');
      if (!thingId) return;

      const commentId = thingId.replace('t1_', '');

      let targetBody = commentEl.querySelector('div[slot="comment"]');
      if (!targetBody) targetBody = commentEl.querySelector('.md');
      if (!targetBody) targetBody = commentEl;
      
      const ghostContainer = document.createElement('div');
      ghostContainer.className = 'unhider-ghost-thread-container';
      
      targetBody.appendChild(ghostContainer);

      const root = createRoot(ghostContainer);
      root.render(<GhostThreadController postId={postId} commentId={commentId} />);
    }
  });
}

function EditHistoryController({ postId, commentId, liveText }: { postId: string, commentId: string, liveText: string }) {
  const [loading, setLoading] = useState(false);
  const [diffResult, setDiffResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleCheck = () => {
    if (open) {
      setOpen(false);
      return;
    }
    if (diffResult || error) {
      setOpen(true);
      return;
    }

    setLoading(true);
    chrome.runtime.sendMessage({ action: 'GET_COMMENTS', postId }, (response: any) => {
      setLoading(false);
      if (response && response.success && response.data) {
        const arr = Array.isArray(response.data) ? response.data : (response.data.data || []);
        const target = arr.find((c: any) => c.id === commentId);
        if (target) {
          const archivedText = target.body_html ? htmlToPlainText(target.body_html) : (target.body || '');
          if (archivedText.trim() === liveText.trim()) {
            setError('No changes found. This comment matches the archive.');
          } else {
            setDiffResult(diffWords(archivedText, liveText));
          }
        } else {
          setError('Not found in archive.');
        }
      } else {
        setError('Failed to fetch archive.');
      }
      setOpen(true);
    });
  };

  return (
    <div style={{ display: 'inline-block', marginLeft: '8px', verticalAlign: 'middle' }}>
      <button 
        onClick={handleCheck}
        style={{
          background: 'transparent', border: '1px solid var(--color-neutral-border-weak)',
          color: 'var(--color-neutral-content-weak)', borderRadius: '999px',
          padding: '2px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-neutral-background-hover)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        {loading ? 'Checking...' : 'Check Edits'}
      </button>

      {open && (
        <div style={{
          marginTop: '8px', padding: '12px', border: '1px solid var(--color-neutral-border-weak)',
          borderRadius: '8px', backgroundColor: 'var(--color-neutral-background-weak)',
          fontSize: '13px', color: 'var(--color-neutral-content-strong)',
          maxWidth: '500px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          position: 'relative', zIndex: 10
        }}>
          {error ? (
            <span style={{ color: 'var(--color-neutral-content-weak)' }}>{error}</span>
          ) : (
             <div>
               <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '11px', color: 'var(--color-neutral-content-weak)', textTransform: 'uppercase' }}>
                 Original vs Current Diff
               </div>
               {diffResult?.map((part, i) => {
                 if (part.type === 'added') {
                   return <span key={i} style={{ backgroundColor: 'rgba(46, 160, 67, 0.2)', color: '#3fb950', textDecoration: 'none' }}>{part.value}</span>;
                 }
                 if (part.type === 'removed') {
                   return <span key={i} style={{ backgroundColor: 'rgba(248, 81, 73, 0.2)', color: '#f85149', textDecoration: 'line-through' }}>{part.value}</span>;
                 }
                 return <span key={i}>{part.value}</span>;
               })}
             </div>
          )}
        </div>
      )}
    </div>
  );
}

function injectEditHistoryDiffs(postId: string) {
  const comments = document.querySelectorAll('shreddit-comment:not([data-unhider-diff-injected="true"])');
  comments.forEach((commentEl: any) => {
    const author = commentEl.getAttribute('author');
    const content = commentEl.textContent || '';
    
    // Skip deleted comments because GhostThread handles them
    if (author === '[deleted]' || content.includes('[deleted]') || content.includes('comment deleted by user')) {
      return;
    }

    commentEl.setAttribute('data-unhider-diff-injected', 'true');
    
    const thingId = commentEl.getAttribute('thingid');
    if (!thingId) return;
    const commentId = thingId.replace('t1_', '');

    const targetBody = commentEl.querySelector('div[slot="comment"]') || commentEl.querySelector('.md') || commentEl;
    const liveText = htmlToPlainText(targetBody.innerHTML || '');

    const actionRow = commentEl.querySelector('shreddit-comment-action-row');
    if (actionRow) {
      const diffContainer = document.createElement('div');
      diffContainer.style.display = 'inline-block';
      if (actionRow.parentNode) {
        actionRow.parentNode.insertBefore(diffContainer, actionRow.nextSibling);
      } else {
        commentEl.appendChild(diffContainer);
      }

      const root = createRoot(diffContainer);
      root.render(<EditHistoryController postId={postId} commentId={commentId} liveText={liveText} />);
    }
  });
}

function initInjector() {
  // We want to insert the view right above the official Reddit post body or comments
  // Reddit uses a shadow DOM or complex tree, but we can just prepend to the main container.
  
  const injectTarget = () => {
    const shredditPost = document.querySelector('shreddit-post');
    if (shredditPost) return shredditPost;

    const main = document.querySelector('main');
    if (main) return main;

    return document.body;
  };

  const isTargetPostDeleted = () => {
    // 1. Is the native post visibly deleted/removed?
    const shredditPost = document.querySelector('shreddit-post');
    if (shredditPost) {
      const html = shredditPost.innerHTML || '';
      if (html.includes('Removed by moderator') || 
          html.includes('deleted by the person who originally posted it') ||
          html.includes('Sorry, this post was removed by Reddit\'s filters') ||
          html.includes('Sorry, this post was removed by the moderators')) {
          return true;
      }
    }
    return false;
  };

  let currentPostId: string | null = null;
  let root: any = null;

  const clearInjectedUi = () => {
    ['reddit-unhide-post-container', 'reddit-unhide-comments-container', 'reddit-unhide-archived-root'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    if (root) {
      root.unmount();
      root = null;
    }
    currentPostId = null;
  };

  const setNativeCommentsVisible = (visible: boolean) => {
    const nativeTree = document.querySelector('shreddit-comment-tree') as HTMLElement | null;
    if (!nativeTree) return;
    nativeTree.style.display = visible ? '' : 'none';
  };

  const attemptInjection = () => {
    const postId = getPostIdFromUrl();
    
    // If we navigated away from a post page, remove the injector
    if (!postId) {
      clearInjectedUi();
      setNativeCommentsVisible(true);
      return;
    }

    // Only operate if the post is actually hidden or deleted!
    if (!isTargetPostDeleted()) {
      clearInjectedUi();
      setNativeCommentsVisible(true);
      injectInlineGhostThreads(postId);
      injectEditHistoryDiffs(postId);
      return;
    }

    // Hide native reddit comments tree if we are taking over
    setNativeCommentsVisible(false);

    // If already injected for this specific post, do nothing
    if (document.getElementById('reddit-unhide-archived-root') && currentPostId === postId) return;

    // If ID changed (SPA navigation between posts), remove old ones
    clearInjectedUi();

    currentPostId = postId;
    const container = document.createElement('div');
    container.id = 'reddit-unhide-archived-root';
    document.body.appendChild(container);

    root = createRoot(container);
    root.render(<MainInjectorController postId={postId} />);
  };

  setTimeout(attemptInjection, 500);
  
  const observer = new MutationObserver(() => attemptInjection());
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Listen to background script for SPA navigation events
  chrome.runtime.onMessage.addListener((request: any) => {
    if (request.action === 'SPA_NAVIGATED') {
      setTimeout(attemptInjection, 200);
    }
  });

  // Also hook popstate just as a safety net
  window.addEventListener('popstate', () => setTimeout(attemptInjection, 200));
}

initInjector();
