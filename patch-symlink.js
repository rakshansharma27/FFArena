const fs = require('fs');
const path = require('path');

function copySync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(child => {
      copySync(path.join(src, child), path.join(dest, child));
    });
  } else {
    // If destination already exists, delete it first to avoid EPERM on overwrite
    if (fs.existsSync(dest)) {
      try {
        fs.unlinkSync(dest);
      } catch (e) {}
    }
    fs.copyFileSync(src, dest);
  }
}

// Override fs.symlinkSync
const originalSymlinkSync = fs.symlinkSync;
fs.symlinkSync = function (target, filepath, type) {
  try {
    const symlinkDir = path.dirname(filepath);
    const resolvedTarget = path.resolve(symlinkDir, target);
    
    // If target exists, copy it instead of symlinking
    if (fs.existsSync(resolvedTarget)) {
      console.log(`[SYM-SHIM] Copying instead of symlinking: ${resolvedTarget} -> ${filepath}`);
      copySync(resolvedTarget, filepath);
      return;
    }
  } catch (err) {
    console.error(`[SYM-SHIM ERROR] copySync failed:`, err);
  }
  return originalSymlinkSync.apply(this, arguments);
};

// Override fs.symlink
const originalSymlink = fs.symlink;
fs.symlink = function (target, filepath, type, callback) {
  let cb = callback;
  let t = type;
  if (typeof type === 'function') {
    cb = type;
    t = undefined;
  }
  
  try {
    const symlinkDir = path.dirname(filepath);
    const resolvedTarget = path.resolve(symlinkDir, target);
    
    if (fs.existsSync(resolvedTarget)) {
      console.log(`[SYM-SHIM] Copying instead of symlinking (async): ${resolvedTarget} -> ${filepath}`);
      copySync(resolvedTarget, filepath);
      if (cb) cb(null);
      return;
    }
  } catch (err) {
    console.error(`[SYM-SHIM ERROR] async copySync failed:`, err);
  }
  
  return originalSymlink.apply(this, arguments);
};

// Also patch fs/promises if used
try {
  const fsp = require('fs/promises');
  if (fsp && fsp.symlink) {
    const originalPromisesSymlink = fsp.symlink;
    fsp.symlink = async function (target, filepath, type) {
      try {
        const symlinkDir = path.dirname(filepath);
        const resolvedTarget = path.resolve(symlinkDir, target);
        if (fs.existsSync(resolvedTarget)) {
          console.log(`[SYM-SHIM] Promises Copying instead of symlinking: ${resolvedTarget} -> ${filepath}`);
          copySync(resolvedTarget, filepath);
          return;
        }
      } catch (err) {
        console.error(`[SYM-SHIM ERROR] promises copySync failed:`, err);
      }
      return originalPromisesSymlink.apply(this, arguments);
    };
  }
} catch (e) {}
