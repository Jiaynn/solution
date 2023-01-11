import { injectable } from 'qn-fe-core/di'

import { MediaStyle } from 'kodo/apis/bucket/image-style'
import { getSourceFormat, getCommandsWithoutSourceFormat, appendSourceFormatToCommands, parseStyleName } from '../../common/command'
import { CommandModule } from '../../common/types'
import {
  Command as DynamicCommand,
  decode as decodeDynamicCoverCommand,
  encode as encodeDynamicCoverCommand
} from '../commands/avthumb'
import {
  Command as StaticCommand,
  areAllKeysPermitted as isStaticCoverCommandStr,
  isVframeCommand as isStaticCoverCommand,
  decode as decodeStaticCoverCommand,
  encode as encodeStaticCoverCommand
} from '../commands/vframe'
import { outputFormatList, SourceFormat, sourceFormatList } from '../utils'

export type ParsedResult = {
  name: string
  sourceFormat: SourceFormat | null
  command: DynamicCommand | StaticCommand
}

@injectable()
export class VideoCoverCommand implements CommandModule<ParsedResult> {

  private ensureSuffixEqualCoverFormat(suffix: string, coverFormat: string) {
    if (suffix !== '' && suffix !== coverFormat) {
      throw new Error('不支持的输出格式')
    }
  }

  async parse(style: MediaStyle): Promise<ParsedResult> {
    const sourceFormat = getSourceFormat<SourceFormat>(style.commands)
    // check source format
    if (sourceFormat != null && !sourceFormatList.includes(sourceFormat)) {
      throw new Error('不支持的源文件格式')
    }
    const commands = getCommandsWithoutSourceFormat(style.commands)
    const { nameSuffix } = parseStyleName(style.name, outputFormatList)
    if (isStaticCoverCommandStr(commands)) {
      const command = decodeStaticCoverCommand(commands)
      this.ensureSuffixEqualCoverFormat(nameSuffix, command.format)
      return {
        name: style.name,
        sourceFormat: sourceFormat as SourceFormat,
        command
      }
    }

    const command = decodeDynamicCoverCommand(commands)
    this.ensureSuffixEqualCoverFormat(nameSuffix, command.format)
    return {
      name: style.name,
      sourceFormat,
      command
    }
  }

  generate(options: ParsedResult): MediaStyle {
    if (isStaticCoverCommand(options.command)) {
      return {
        name: options.name,
        persistence_enable: true,
        commands: appendSourceFormatToCommands(options.sourceFormat, encodeStaticCoverCommand(options.command))
      }
    }

    return {
      name: options.name,
      persistence_enable: true,
      commands: appendSourceFormatToCommands(options.sourceFormat, encodeDynamicCoverCommand(options.command))
    }
  }

  async isSupported(style: MediaStyle) {
    try {
      await this.parse(style)
    } catch {
      return false
    }
    return true
  }

  async isEqualOutputFormat(a: MediaStyle, b: MediaStyle): Promise<boolean> {
    if (await this.isSupported(a) && await this.isSupported(b)) {
      const aInfo = await this.parse(a)
      const bInfo = await this.parse(b)
      return aInfo.command.format === bInfo.command.format
    }

    return false
  }
}
